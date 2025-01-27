package fr.gouv.cacem.monitorenv.infrastructure.database.repositories

import fr.gouv.cacem.monitorenv.domain.entities.VehicleTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.controlUnit.LegacyControlUnitEntity
import fr.gouv.cacem.monitorenv.domain.entities.controlUnit.LegacyControlUnitResourceEntity
import fr.gouv.cacem.monitorenv.domain.entities.mission.MissionEntity
import fr.gouv.cacem.monitorenv.domain.entities.mission.MissionSourceEnum
import fr.gouv.cacem.monitorenv.domain.entities.mission.MissionTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.mission.envAction.EnvActionNoteEntity
import fr.gouv.cacem.monitorenv.domain.entities.mission.envAction.EnvActionSurveillanceEntity
import fr.gouv.cacem.monitorenv.domain.entities.mission.envAction.ThemeEntity
import fr.gouv.cacem.monitorenv.domain.entities.mission.envAction.envActionControl.ActionTargetTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.mission.envAction.envActionControl.EnvActionControlEntity
import fr.gouv.cacem.monitorenv.domain.entities.mission.envAction.envActionControl.infraction.*
import fr.gouv.cacem.monitorenv.domain.use_cases.missions.dtos.MissionDTO
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.MultiPoint
import org.locationtech.jts.geom.MultiPolygon
import org.locationtech.jts.io.WKTReader
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.dao.InvalidDataAccessApiUsageException
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime
import java.util.*

class JpaMissionRepositoryITests : AbstractDBTests() {
    @Autowired private lateinit var jpaMissionRepository: JpaMissionRepository

    @Autowired private lateinit var jpaReportingRepository: JpaReportingRepository

    @Autowired private lateinit var jpaControlUnitRepository: JpaControlUnitRepository

    @Autowired
    private lateinit var jpaControlUnitResourceRepository: JpaControlUnitResourceRepository

    @Test
    @Transactional
    fun `findByControlUnitId should find the matching missions`() {
        val foundMissions = jpaMissionRepository.findByControlUnitId(10002)

        assertThat(foundMissions).hasSize(17)
    }

    @Test
    @Transactional
    fun `findByControlUnitResourceId should find the matching missions`() {
        val foundMissions = jpaMissionRepository.findByControlUnitResourceId(8)

        assertThat(foundMissions).hasSize(4)
    }

    @Test
    @Transactional
    fun `save should create a new mission`() {
        // Given
        val existingMissions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2022-01-01T10:54:00Z").toInstant(),
                startedBefore = ZonedDateTime.parse("2022-08-08T00:00:00Z").toInstant(),
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                pageable = Pageable.unpaged(),
            )

        assertThat(existingMissions).hasSize(21)

        val wktReader = WKTReader()

        val multipolygonString =
            "MULTIPOLYGON(((-2.7335 47.6078, -2.7335 47.8452, -3.6297 47.8452, -3.6297 47.6078, -2.7335 47.6078)))"
        val polygon = wktReader.read(multipolygonString) as MultiPolygon

        val multipointString = "MULTIPOINT((49.354105 -0.427455))"
        val point = wktReader.read(multipointString) as MultiPoint

        val noteObservations = "Quelqu'un aurait vu quelque chose quelque part à un certain moment."

        val newMission =
            MissionEntity(
                missionTypes = listOf(MissionTypeEnum.SEA),
                startDateTimeUtc = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
                isClosed = false,
                isDeleted = false,
                missionSource = MissionSourceEnum.MONITORENV,
                hasMissionOrder = false,
                isUnderJdp = false,
                envActions =
                listOf(
                    EnvActionControlEntity(
                        id =
                        UUID.fromString(
                            "33310163-4e22-4d3d-b585-dac4431eb4b5",
                        ),
                        facade = "Facade 1",
                        department = "Department 1",
                        geom = point,
                        vehicleType = VehicleTypeEnum.VEHICLE_LAND,
                        isAdministrativeControl = true,
                        isComplianceWithWaterRegulationsControl = true,
                        isSafetyEquipmentAndStandardsComplianceControl =
                        true,
                        isSeafarersControl = true,
                    ),
                    EnvActionSurveillanceEntity(
                        id =
                        UUID.fromString(
                            "a6c4bd17-eb45-4504-ab15-7a18ea714a10",
                        ),
                        facade = "Facade 2",
                        department = "Department 2",
                        geom = polygon,
                    ),
                    EnvActionNoteEntity(
                        id =
                        UUID.fromString(
                            "126ded89-2dc0-4c77-9bf2-49f86b9a71a1",
                        ),
                        observations = noteObservations,
                    ),
                ),
                controlUnits =
                listOf(
                    LegacyControlUnitEntity(
                        id = 10121,
                        name = "PAM Jeanne Barret",
                        administration = "DIRM / DM",
                        isArchived = false,
                        resources =
                        listOf(
                            LegacyControlUnitResourceEntity(
                                id = 8,
                                controlUnitId = 10121,
                                name = "PAM Jeanne Barret",
                            ),
                        ),
                    ),
                ),
                isGeometryComputedFromControls = false,
            )

        // When
        val newMissionCreated = jpaMissionRepository.save(newMission)

        // Then
        assertThat(newMissionCreated.mission.controlUnits).hasSize(1)
        assertThat(newMissionCreated.mission.controlUnits.first().id).isEqualTo(10121)
        assertThat(newMissionCreated.mission.controlUnits.first().name)
            .isEqualTo("PAM Jeanne Barret")
        assertThat(newMissionCreated.mission.controlUnits.first().administration)
            .isEqualTo("DIRM / DM")
        assertThat(newMissionCreated.mission.controlUnits.first().resources).hasSize(1)
        assertThat(newMissionCreated.mission.controlUnits.first().resources.first().id).isEqualTo(8)
        assertThat(newMissionCreated.mission.controlUnits.first().resources.first().controlUnitId)
            .isEqualTo(10121)
        assertThat(newMissionCreated.mission.controlUnits.first().resources.first().name)
            .isEqualTo("PAM Jeanne Barret")
        assertThat(newMissionCreated.mission.envActions).hasSize(3)
        assertThat(newMissionCreated.mission.envActions?.first()?.facade).isEqualTo("Facade 1")
        assertThat(newMissionCreated.mission.envActions?.first()?.department)
            .isEqualTo("Department 1")
        assertThat(newMissionCreated.mission.envActions?.get(1)?.facade).isEqualTo("Facade 2")
        assertThat(newMissionCreated.mission.envActions?.get(1)?.department)
            .isEqualTo("Department 2")
        assertThat(
            (newMissionCreated.mission.envActions?.get(2) as EnvActionNoteEntity)
                .observations,
        )
            .isEqualTo(
                noteObservations,
            )

        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2022-01-01T10:54:00Z").toInstant(),
                startedBefore = ZonedDateTime.parse("2022-08-08T00:00:00Z").toInstant(),
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                pageable = Pageable.unpaged(),
            )

        assertThat(missions).hasSize(22)
    }

    @Test
    @Transactional
    fun `save should update mission resources`() {
        // Given
        val newMission =
            MissionEntity(
                missionTypes = listOf(MissionTypeEnum.SEA),
                startDateTimeUtc = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
                isClosed = false,
                isDeleted = false,
                missionSource = MissionSourceEnum.MONITORENV,
                hasMissionOrder = false,
                isUnderJdp = false,
                controlUnits =
                listOf(
                    LegacyControlUnitEntity(
                        id = 10004,
                        name = "DPM – DDTM 35",
                        administration = "DDTM",
                        isArchived = false,
                        resources =
                        listOf(
                            LegacyControlUnitResourceEntity(
                                id = 8,
                                controlUnitId = 10004,
                                name = "PAM Jeanne Barret",
                            ),
                        ),
                    ),
                ),
                isGeometryComputedFromControls = false,
            )
        jpaMissionRepository.save(newMission)

        // When
        val newMissionUpdated =
            jpaMissionRepository.save(
                newMission.copy(
                    controlUnits =
                    listOf(
                        LegacyControlUnitEntity(
                            id = 10002,
                            name = "DML 2A",
                            administration = "DIRM / DM",
                            isArchived = false,
                            resources =
                            listOf(
                                LegacyControlUnitResourceEntity(
                                    id = 3,
                                    controlUnitId =
                                    10002,
                                    name =
                                    "Semi-rigide 1",
                                ),
                                LegacyControlUnitResourceEntity(
                                    id = 5,
                                    controlUnitId =
                                    10002,
                                    name = "Voiture",
                                ),
                            ),
                        ),
                    ),
                ),
            )

        // Then
        assertThat(newMissionUpdated.mission.controlUnits).hasSize(1)
        assertThat(newMissionUpdated.mission.controlUnits.first().id).isEqualTo(10002)
        assertThat(newMissionUpdated.mission.controlUnits.first().name).isEqualTo("DML 2A")
        assertThat(newMissionUpdated.mission.controlUnits.first().administration)
            .isEqualTo("DIRM / DM")
        assertThat(newMissionUpdated.mission.controlUnits.first().resources).hasSize(2)
        assertThat(newMissionUpdated.mission.controlUnits.first().resources.first().id).isEqualTo(3)
        assertThat(newMissionUpdated.mission.controlUnits.first().resources.first().controlUnitId)
            .isEqualTo(10002)
        assertThat(newMissionUpdated.mission.controlUnits.first().resources.first().name)
            .isEqualTo("Semi-rigide 1")
        assertThat(newMissionUpdated.mission.controlUnits.first().resources.last().id).isEqualTo(5)
        assertThat(newMissionUpdated.mission.controlUnits.first().resources.last().controlUnitId)
            .isEqualTo(10002)
        assertThat(newMissionUpdated.mission.controlUnits.first().resources.last().name)
            .isEqualTo("Voiture")
    }

    @Test
    @Transactional
    fun `save should update existing mission with existing resources`() {
        // Given
        val mission = jpaMissionRepository.findById(25)
        val newControlUnitResource = jpaControlUnitResourceRepository.findById(10)
        val newControlUnit =
            jpaControlUnitRepository.findById(
                requireNotNull(newControlUnitResource.controlUnit.id),
            )

        val nextMission =
            mission.copy(
                controlUnits =
                mission.controlUnits.plus(
                    LegacyControlUnitEntity(
                        id = requireNotNull(newControlUnit.controlUnit.id),
                        administration = newControlUnit.administration.name,
                        isArchived = newControlUnit.controlUnit.isArchived,
                        name = newControlUnit.controlUnit.name,
                        resources =
                        listOf(
                            newControlUnitResource
                                .toLegacyControlUnitResource(),
                        ),
                        contact = null,
                    ),
                ),
            )

        val updatedMission = jpaMissionRepository.save(nextMission)

        assertThat(updatedMission.mission.controlUnits).hasSize(2)
        assertThat(updatedMission.mission.controlUnits.first().id).isEqualTo(10002)
        assertThat(updatedMission.mission.controlUnits.first().resources).hasSize(1)
        assertThat(updatedMission.mission.controlUnits.first().resources.first().id).isEqualTo(3)
        assertThat(updatedMission.mission.controlUnits.first().resources.first().controlUnitId)
            .isEqualTo(10002)
        assertThat(updatedMission.mission.controlUnits.last().id).isEqualTo(10018)
        assertThat(updatedMission.mission.controlUnits.last().resources).hasSize(1)
        assertThat(updatedMission.mission.controlUnits.last().resources.first().id).isEqualTo(10)
        assertThat(updatedMission.mission.controlUnits.last().resources.first().controlUnitId)
            .isEqualTo(10018)
    }

    @Test
    @Transactional
    fun `save should throw an exception When the resource id is not found`() {
        // Given
        val newMission =
            MissionEntity(
                missionTypes = listOf(MissionTypeEnum.SEA),
                startDateTimeUtc = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
                isClosed = false,
                isDeleted = false,
                missionSource = MissionSourceEnum.MONITORENV,
                hasMissionOrder = false,
                isUnderJdp = false,
                controlUnits =
                listOf(
                    LegacyControlUnitEntity(
                        id = 5,
                        name = "DPM – DDTM 35",
                        administration = "DDTM",
                        isArchived = false,
                        resources =
                        listOf(
                            LegacyControlUnitResourceEntity(
                                id = 123456,
                                controlUnitId = 5,
                                name = "PAM Jeanne Barret",
                            ),
                        ),
                    ),
                ),
                isGeometryComputedFromControls = false,
            )

        // When
        val throwable = catchThrowable { jpaMissionRepository.save(newMission) }

        // Then
        assertThat(throwable).isInstanceOf(InvalidDataAccessApiUsageException::class.java)
    }

    @Test
    @Transactional
    fun `save should throw an exception When the unit id is not found`() {
        // Given
        val newMission =
            MissionEntity(
                missionTypes = listOf(MissionTypeEnum.SEA),
                startDateTimeUtc = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
                isClosed = false,
                isDeleted = false,
                missionSource = MissionSourceEnum.MONITORENV,
                hasMissionOrder = false,
                isUnderJdp = false,
                controlUnits =
                listOf(
                    LegacyControlUnitEntity(
                        id = 123456,
                        name = "PAM Jeanne Barret",
                        administration = "",
                        isArchived = false,
                        resources = listOf(),
                    ),
                ),
                isGeometryComputedFromControls = false,
            )

        // When
        val throwable = catchThrowable { jpaMissionRepository.save(newMission) }

        // Then
        assertThat(throwable).isInstanceOf(DataIntegrityViolationException::class.java)
    }

    @Test
    @Transactional
    fun `findAll Should return all missions when only required startedAfter is set to a very old date`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2022-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(54)
    }

    @Test
    @Transactional
    fun `findAll Should return filtered missions when startedAfter & startedBefore are set`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2022-01-01T10:54:00Z").toInstant(),
                startedBefore = ZonedDateTime.parse("2022-08-08T00:00:00Z").toInstant(),
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(21)
    }

    @Test
    @Transactional
    fun `findAll Should return filtered missions when missionTypes is set`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = listOf("SEA"),
                missionStatuses = null,
                seaFronts = null,
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(22)
    }

    @Test
    @Transactional
    fun `findAll Should return filtered missions when multiple missionTypes are set`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = listOf("SEA", "LAND"),
                missionStatuses = null,
                seaFronts = null,
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(45)
    }

    @Test
    @Transactional
    fun `findAll Should return filtered missions when seaFront is set to MEMN`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = null,
                missionStatuses = null,
                seaFronts = listOf("MEMN"),
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(9)
    }

    @Test
    @Transactional
    fun `findAll Should return filtered missions when seaFront is set to MEMN and NAMO`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = null,
                missionStatuses = null,
                seaFronts = listOf("MEMN", "NAMO"),
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(27)
    }

    @Test
    @Transactional
    fun `findAll Should return filtered missions when status is set to UPCOMING`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = null,
                seaFronts = null,
                missionStatuses = listOf("UPCOMING"),
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(7)
    }

    @Test
    @Transactional
    fun `findAll Should return filtered missions when status is set to PENDING`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = null,
                seaFronts = null,
                missionStatuses = listOf("PENDING"),
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(14)
    }

    @Test
    @Transactional
    fun `findAll Should return filtered missions when status is set to ENDED`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = null,
                seaFronts = null,
                missionStatuses = listOf("ENDED"),
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(15)
    }

    @Test
    @Transactional
    fun `findAll Should return filtered missions when status is set to CLOSED`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = null,
                seaFronts = null,
                missionStatuses = listOf("CLOSED"),
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(18)
    }

    @Test
    @Transactional
    fun `findAll Should return filtered missions when status is set to CLOSED or UPCOMING`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = null,
                seaFronts = null,
                missionStatuses = listOf("CLOSED", "UPCOMING"),
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(25)
    }

    @Test
    @Transactional
    fun `findAll with pagenumber and pagesize Should return subset of missions`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                pageable = PageRequest.of(1, 10),
            )
        assertThat(missions).hasSize(10)
    }

    @Test
    @Transactional
    fun `findAll should filter missions based on MissionSources`() {
        // When
        val missions =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2000-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                missionSources =
                listOf(
                    MissionSourceEnum.MONITORFISH,
                    MissionSourceEnum.POSEIDON_CACEM,
                    MissionSourceEnum.POSEIDON_CNSP,
                ),
                pageable = Pageable.unpaged(),
            )
        assertThat(missions).hasSize(3)
    }

    @Test
    @Transactional
    fun `findById Should return specified mission`() {
        // When
        val wktReader = WKTReader()
        val multipolygonString =
            "MULTIPOLYGON (((-4.99360539 48.42853215, -4.99359905 48.42848997, -4.99359291 48.42844777, -4.99358697 48.42840556, -4.99358123 48.42836334, -4.99357569 48.4283211, -4.99357035 48.42827886, -4.9935652 48.4282366, -4.99356026 48.42819434, -4.99355552 48.42815206, -4.99355097 48.42810977, -4.99354663 48.42806748, -4.99354249 48.42802517, -4.99353854 48.42798286, -4.9935348 48.42794054, -4.99353125 48.42789821, -4.99352791 48.42785587, -4.99352476 48.42781353, -4.99352182 48.42777118, -4.99351907 48.42772882, -4.99351653 48.42768646, -4.99351418 48.4276441, -4.99351203 48.42760173, -4.99351009 48.42755935, -4.99350834 48.42751697, -4.9935068 48.42747459, -4.99350545 48.42743221, -4.99350431 48.42738982, -4.99350336 48.42734743, -4.99350262 48.42730504, -4.99350207 48.42726264, -4.99350173 48.42722025, -4.99350158 48.42717785, -4.99350164 48.42713546, -4.99350189 48.42709307, -4.99350235 48.42705067, -4.99350301 48.42700828, -4.99350386 48.42696589, -4.99350492 48.4269235, -4.99350617 48.42688111, -4.99350763 48.42683873, -4.99350929 48.42679635, -4.99351114 48.42675397, -4.9935132 48.4267116, -4.99351545 48.42666923, -4.99351791 48.42662687, -4.99352057 48.42658451, -4.99352342 48.42654216, -4.99352648 48.42649981, -4.99352973 48.42645747, -4.99353319 48.42641514, -4.99353685 48.42637282, -4.9935407 48.4263305, -4.99354476 48.42628819, -4.99354901 48.42624589, -4.99355346 48.4262036, -4.99355812 48.42616132, -4.99356297 48.42611905, -4.99356802 48.42607679, -4.99357328 48.42603454, -4.99357873 48.4259923, -4.99358438 48.42595007, -4.99359023 48.42590785, -4.99359628 48.42586565, -4.99360253 48.42582346, -4.99360898 48.42578128, -4.99361562 48.42573912, -4.99362247 48.42569697, -4.99362951 48.42565484, -4.99363676 48.42561272, -4.9936442 48.42557061, -4.99365184 48.42552853, -4.99365968 48.42548645, -4.99366772 48.4254444, -4.99367596 48.42540236, -4.99368439 48.42536034, -4.99369302 48.42531833, -4.99370186 48.42527635, -4.99371089 48.42523438, -4.99372011 48.42519243, -4.99372954 48.42515051, -4.99373916 48.4251086, -4.99374898 48.42506671, -4.993759 48.42502484, -4.99376922 48.424983, -4.99377963 48.42494117, -4.99379024 48.42489937, -4.99380105 48.42485759, -4.99381206 48.42481583, -4.99382326 48.4247741, -4.99383466 48.42473239, -4.99384626 48.4246907, -4.99385805 48.42464904, -4.99387004 48.42460741, -4.99388223 48.42456579, -4.99389461 48.42452421, -4.99390719 48.42448265, -4.99391996 48.42444111, -4.99393293 48.42439961, -4.9939461 48.42435813, -4.99395946 48.42431668, -4.99397302 48.42427525, -4.99398677 48.42423386, -4.99400072 48.42419249, -4.99401487 48.42415116, -4.9940292 48.42410985, -4.99404374 48.42406857, -4.99405847 48.42402733, -4.99407339 48.42398611, -4.99408851 48.42394493, -4.99410382 48.42390378, -4.99411932 48.42386266, -4.99413502 48.42382157, -4.99415092 48.42378052, -4.994167 48.4237395, -4.99418328 48.42369851, -4.99419976 48.42365756, -4.99421643 48.42361664, -4.99423329 48.42357576, -4.99425034 48.42353491, -4.99426759 48.4234941, -4.99428502 48.42345333, -4.99430265 48.42341259, -4.99432048 48.42337189, -4.99433849 48.42333122, -4.9943567 48.4232906, -4.9943751 48.42325001, -4.99439369 48.42320946, -4.99441247 48.42316895, -4.99443144 48.42312848, -4.9944506 48.42308805, -4.99446996 48.42304766, -4.9944895 48.42300731, -4.99450924 48.422967, -4.99452916 48.42292673, -4.99454928 48.42288651, -4.99456958 48.42284633, -4.99459007 48.42280619, -4.99461076 48.42276609, -4.99463163 48.42272603, -4.99465269 48.42268602, -4.99467394 48.42264606, -4.99469538 48.42260614, -4.99471701 48.42256626, -4.99473882 48.42252643, -4.99476082 48.42248665, -4.99478301 48.42244691, -4.99480539 48.42240721, -4.99482796 48.42236757, -4.99485071 48.42232797, -4.99487365 48.42228842, -4.99489677 48.42224892, -4.99492008 48.42220947, -4.99494358 48.42217006, -4.99496727 48.42213071, -4.99499113 48.4220914, -4.99501519 48.42205215, -4.99503943 48.42201294, -4.99506385 48.42197379, -4.99508846 48.42193469, -4.99511326 48.42189563, -4.99513823 48.42185664, -4.99516339 48.42181769, -4.99518874 48.4217788, -4.99521427 48.42173995, -4.99523998 48.42170117, -4.99526587 48.42166243, -4.99529195 48.42162376, -4.99531821 48.42158513, -4.99534465 48.42154656, -4.99537128 48.42150805, -4.99539808 48.42146959, -4.99542507 48.42143119, -4.99545224 48.42139285, -4.99547959 48.42135456, -4.99550711 48.42131633, -4.99553482 48.42127816, -4.99556271 48.42124004, -4.99559078 48.42120199, -4.99561903 48.42116399, -4.99564746 48.42112605, -4.99567606 48.42108817, -4.99570485 48.42105035, -4.99573381 48.4210126, -4.99576295 48.4209749, -4.99579227 48.42093726, -4.99582177 48.42089969, -4.99585144 48.42086218, -4.99588129 48.42082473, -4.99591132 48.42078734, -4.99594152 48.42075001, -4.9959719 48.42071275, -4.99600246 48.42067555, -4.99603319 48.42063842, -4.9960641 48.42060135, -4.99609518 48.42056435, -4.99612643 48.42052741, -4.99615786 48.42049053, -4.99618946 48.42045372, -4.99622124 48.42041698, -4.99625319 48.42038031, -4.99628531 48.4203437, -4.9963176 48.42030716, -4.99635007 48.42027069, -4.99638271 48.42023428, -4.99641552 48.42019794, -4.9964485 48.42016168, -4.99648166 48.42012548, -4.99651498 48.42008935, -4.99654847 48.42005329, -4.99658214 48.4200173, -4.99661597 48.41998138, -4.99664997 48.41994553, -4.99668415 48.41990976, -4.99671849 48.41987405, -4.996753 48.41983842, -4.99678767 48.41980286, -4.99682252 48.41976737, -4.99685753 48.41973196, -4.99689271 48.41969662, -4.99692805 48.41966135, -4.99696356 48.41962616, -4.99699924 48.41959104, -4.99703508 48.41955599, -4.99707109 48.41952102, -4.99710726 48.41948613, -4.9971436 48.41945131, -4.9971801 48.41941657, -4.99721677 48.4193819, -4.9972536 48.41934732, -4.99729059 48.4193128, -4.99732774 48.41927837, -4.99736506 48.41924402, -4.99740254 48.41920974, -4.99744018 48.41917554, -4.99747798 48.41914142, -4.99751594 48.41910738, -4.99755406 48.41907342, -4.99759234 48.41903953, -4.99763079 48.41900573, -4.99766939 48.41897201, -4.99770815 48.41893837, -4.99774707 48.41890481, -4.99778614 48.41887133, -4.99782538 48.41883794, -4.99786477 48.41880463, -4.99790432 48.4187714, -4.99794402 48.41873825, -4.99798388 48.41870518, -4.9980239 48.4186722, -4.99806408 48.4186393, -4.9981044 48.41860649, -4.99814489 48.41857376, -4.99818552 48.41854112, -4.99822631 48.41850856, -4.99826726 48.41847609, -4.99830835 48.4184437, -4.9983496 48.4184114, -4.99839101 48.41837918, -4.99843256 48.41834705, -4.99847426 48.41831501, -4.99851612 48.41828306, -4.99855813 48.41825119, -4.99860028 48.41821941, -4.99864259 48.41818772, -4.99868504 48.41815612, -4.99872765 48.41812461, -4.9987704 48.41809319, -4.9988133 48.41806185, -4.99885635 48.41803061, -4.99889955 48.41799946, -4.99894289 48.41796839, -4.99898638 48.41793742, -4.99903001 48.41790654, -4.99907379 48.41787575, -4.99911772 48.41784505, -4.99916179 48.41781444, -4.999206 48.41778393, -4.99925036 48.41775351, -4.99929486 48.41772318, -4.99933951 48.41769294, -4.99938429 48.4176628, -4.99942922 48.41763276, -4.99947429 48.4176028, -4.9995195 48.41757294, -4.99956485 48.41754318, -4.99961035 48.41751351, -4.99965598 48.41748393, -4.99970175 48.41745445, -4.99974766 48.41742507, -4.99979371 48.41739578, -4.99983989 48.41736659, -4.99988622 48.4173375, -4.99993268 48.4173085, -4.99997927 48.4172796, -5.00002601 48.4172508, -5.00007288 48.4172221, -5.00011988 48.41719349, -5.00016702 48.41716498, -5.00021429 48.41713657, -5.0002617 48.41710826, -5.00030924 48.41708005, -5.00035691 48.41705194, -5.00040472 48.41702393, -5.00045266 48.41699602, -5.00050072 48.41696821, -5.00054892 48.4169405, -5.00059725 48.41691289, -5.00064571 48.41688538, -5.0006943 48.41685797, -5.00074302 48.41683067, -5.00079187 48.41680346, -5.00084085 48.41677636, -5.00088995 48.41674937, -5.00093918 48.41672247, -5.00098854 48.41669568, -5.00103802 48.41666899, -5.00108763 48.4166424, -5.00113736 48.41661592, -5.00118722 48.41658954, -5.0012372 48.41656327, -5.00128731 48.4165371, -5.00133754 48.41651104, -5.00138789 48.41648508, -5.00143837 48.41645923, -5.00148896 48.41643348, -5.00153968 48.41640784, -5.00159052 48.4163823, -5.00164148 48.41635688, -5.00169256 48.41633155, -5.00174375 48.41630634, -5.00179507 48.41628123, -5.0018465 48.41625623, -5.00189805 48.41623134, -5.00194972 48.41620655, -5.00200151 48.41618187, -5.00205341 48.41615731, -5.00210543 48.41613285, -5.00215756 48.4161085, -5.00220981 48.41608425, -5.00226217 48.41606012, -5.00231465 48.4160361, -5.00236723 48.41601219, -5.00241993 48.41598838, -5.00247275 48.41596469, -5.00252567 48.41594111, -5.00257871 48.41591764, -5.00263185 48.41589428, -5.00268511 48.41587103, -5.00273847 48.41584789, -5.00279195 48.41582486, -5.00284553 48.41580195, -5.00289922 48.41577915, -5.00295301 48.41575646, -5.00300692 48.41573388, -5.00306093 48.41571142, -5.00311504 48.41568907, -5.00316927 48.41566683, -5.00322359 48.4156447, -5.00327802 48.41562269, -5.00333255 48.4156008, -5.00338719 48.41557901, -5.00344193 48.41555735, -5.00349677 48.41553579, -5.00355171 48.41551435, -5.00360676 48.41549303, -5.0036619 48.41547182, -5.00371714 48.41545073, -5.00377249 48.41542975, -5.00382793 48.41540889, -5.00388347 48.41538814, -5.0039391 48.41536751, -5.00399484 48.415347, -5.00405067 48.4153266, -5.00410659 48.41530632, -5.00416261 48.41528616, -5.00421873 48.41526611, -5.00427494 48.41524619, -5.00433125 48.41522638, -5.00438764 48.41520668, -5.00444413 48.41518711, -5.00450072 48.41516765, -5.00455739 48.41514831, -5.00461416 48.41512909, -5.00467101 48.41510999, -5.00472796 48.41509101, -5.00478499 48.41507215, -5.00484211 48.41505341, -5.00489932 48.41503478, -5.00495662 48.41501628, -5.00501401 48.4149979, -5.00507148 48.41497963, -5.00512904 48.41496149, -5.00518668 48.41494347, -5.00524441 48.41492556, -5.00530222 48.41490778, -5.00536012 48.41489012, -5.0054181 48.41487258, -5.00547616 48.41485516, -5.0055343 48.41483786, -5.00559252 48.41482069, -5.00565083 48.41480364, -5.00570921 48.4147867, -5.00576768 48.4147699, -5.00582622 48.41475321, -5.00588485 48.41473664, -5.00594355 48.4147202, -5.00600232 48.41470388, -5.00606118 48.41468769, -5.00612011 48.41467161, -5.00617911 48.41465566, -5.00623819 48.41463984, -5.00629735 48.41462414, -5.00635658 48.41460856, -5.00641588 48.4145931, -5.00647525 48.41457777, -5.0065347 48.41456257, -5.00659422 48.41454748, -5.00665381 48.41453253, -5.00671347 48.41451769, -5.0067732 48.41450298, -5.00683299 48.4144884, -5.00689286 48.41447394, -5.00695279 48.41445961, -5.0070128 48.4144454, -5.00707286 48.41443132, -5.007133 48.41441736, -5.0071932 48.41440353, -5.00725346 48.41438983, -5.00731379 48.41437625, -5.00737419 48.4143628, -5.00743464 48.41434947, -5.00749516 48.41433627, -5.00755574 48.4143232, -5.00761638 48.41431025, -5.00767709 48.41429743, -5.00773785 48.41428474, -5.00779867 48.41427218, -5.00785955 48.41425974, -5.00792049 48.41424743, -5.00798149 48.41423525, -5.00804255 48.41422319, -5.00810366 48.41421126, -5.00816482 48.41419946, -5.00822605 48.41418779, -5.00828732 48.41417625, -5.00834866 48.41416483, -5.00841004 48.41415354, -5.00847148 48.41414238, -5.00853297 48.41413135, -5.00859451 48.41412045, -5.0086561 48.41410968, -5.00871775 48.41409903, -5.00877944 48.41408852, -5.00884119 48.41407813, -5.00890298 48.41406787, -5.00896482 48.41405775, -5.0090267 48.41404775, -5.00908864 48.41403788, -5.00915062 48.41402814, -5.00921264 48.41401853, -5.00927471 48.41400905, -5.00933683 48.4139997, -5.00939899 48.41399048, -5.00946119 48.41398139, -5.00952344 48.41397243, -5.00958572 48.4139636, -5.00964805 48.4139549, -5.00971042 48.41394633, -5.00977283 48.41393789, -5.00983528 48.41392958, -5.00989777 48.4139214, -5.00996029 48.41391335, -5.01002285 48.41390544, -5.01008545 48.41389765, -5.01014809 48.41389, -5.01021076 48.41388247, -5.01027347 48.41387508, -5.01033621 48.41386782, -5.01039899 48.41386069, -5.0104618 48.41385369, -5.01052464 48.41384682, -5.01058752 48.41384009, -5.01065042 48.41383348, -5.01071336 48.41382701, -5.01077633 48.41382067, -5.01083932 48.41381446, -5.01090235 48.41380838, -5.0109654 48.41380243, -5.01102848 48.41379662, -5.01109159 48.41379094, -5.01115473 48.41378539, -5.01121789 48.41377997, -5.01128107 48.41377468, -5.01134429 48.41376953, -5.01140752 48.41376451, -5.01147078 48.41375962, -5.01153406 48.41375486, -5.01159736 48.41375023, -5.01166069 48.41374574, -5.01172403 48.41374138, -5.0117874 48.41373715, -5.01185078 48.41373306, -5.01191419 48.41372909, -5.01197761 48.41372526, -5.01204105 48.41372157, -5.01210451 48.413718, -5.01216798 48.41371457, -5.01223147 48.41371127, -5.01229498 48.4137081, -5.0123585 48.41370507, -5.01242203 48.41370217, -5.01248558 48.4136994, -5.01254914 48.41369676, -5.01261271 48.41369426, -5.0126763 48.41369189, -5.01273989 48.41368965, -5.0128035 48.41368755, -5.01286711 48.41368558, -5.01293073 48.41368374, -5.01299437 48.41368204, -5.013058 48.41368047, -5.01312165 48.41367903, -5.0131853 48.41367772, -5.01324896 48.41367655, -5.01331263 48.41367551, -5.0133763 48.41367461, -5.01343997 48.41367383, -5.01350364 48.41367319, -5.01356732 48.41367269, -5.013631 48.41367231, -5.01369469 48.41367207, -5.01375837 48.41367197, -5.01382205 48.41367199, -5.01388573 48.41367215, -5.01394942 48.41367244, -5.0140131 48.41367287, -5.01407677 48.41367343, -5.01414045 48.41367412, -5.01420412 48.41367494, -5.01426779 48.4136759, -5.01433145 48.41367699, -5.01439511 48.41367822, -5.01445876 48.41367957, -5.0145224 48.41368106, -5.01458604 48.41368269, -5.01464966 48.41368444, -5.01471328 48.41368633, -5.0147769 48.41368836, -5.0148405 48.41369051, -5.01490409 48.4136928, -5.01496767 48.41369522, -5.01503123 48.41369778, -5.01509479 48.41370046, -5.01515833 48.41370328, -5.01522186 48.41370624, -5.01528537 48.41370932, -5.01534887 48.41371254, -5.01541236 48.41371589, -5.01547582 48.41371938, -5.01553928 48.41372299, -5.01560271 48.41372674, -5.01566613 48.41373062, -5.01572952 48.41373464, -5.0157929 48.41373879, -5.01585626 48.41374307, -5.0159196 48.41374748, -5.01598291 48.41375202, -5.01604621 48.4137567, -5.01610948 48.41376151, -5.01617273 48.41376645, -5.01623595 48.41377152, -5.01629915 48.41377673, -5.01636233 48.41378207, -5.01642548 48.41378754, -5.01648861 48.41379314, -5.01655171 48.41379887, -5.01661478 48.41380474, -5.01667782 48.41381074, -5.01674083 48.41381687, -5.01680382 48.41382313, -5.01686677 48.41382952, -5.0169297 48.41383605, -5.01699259 48.4138427, -5.01705545 48.41384949, -5.01711828 48.41385641, -5.01718108 48.41386346, -5.01724384 48.41387064, -5.01730657 48.41387795, -5.01736927 48.4138854, -5.01743192 48.41389297, -5.01749455 48.41390068, -5.01755713 48.41390851, -5.01761968 48.41391648, -5.01768219 48.41392458, -5.01774467 48.41393281, -5.0178071 48.41394117, -5.01786949 48.41394966, -5.01793185 48.41395828, -5.01799416 48.41396703, -5.01805643 48.41397591, -5.01811866 48.41398492, -5.01818084 48.41399406, -5.01824298 48.41400333, -5.01830508 48.41401274, -5.01836714 48.41402227, -5.01842914 48.41403193, -5.01849111 48.41404172, -5.01855302 48.41405164, -5.01861489 48.41406169, -5.01867671 48.41407186, -5.01873848 48.41408217, -5.01880021 48.41409261, -5.01886188 48.41410317, -5.01892351 48.41411387, -5.01898508 48.41412469, -5.0190466 48.41413565, -5.01910807 48.41414673, -5.01916949 48.41415794, -5.01923085 48.41416927, -5.01929216 48.41418074, -5.01935342 48.41419233, -5.01941462 48.41420405, -5.01947577 48.4142159, -5.01953686 48.41422788, -5.01959789 48.41423999, -5.01965886 48.41425222, -5.01971978 48.41426458, -5.01978064 48.41427707, -5.01984144 48.41428968, -5.01990218 48.41430242, -5.01996286 48.41431529, -5.02002348 48.41432829, -5.02008403 48.41434141, -5.02014453 48.41435466, -5.02020496 48.41436804, -5.02026533 48.41438154, -5.02032563 48.41439517, -5.02038587 48.41440892, -5.02044604 48.4144228, -5.02050615 48.4144368, -5.0205662 48.41445093, -5.02062617 48.41446519, -5.02068608 48.41447957, -5.02074592 48.41449408, -5.02080569 48.41450871, -5.02086539 48.41452347, -5.02092502 48.41453835, -5.02098458 48.41455336, -5.02104407 48.41456849, -5.02110349 48.41458374, -5.02116284 48.41459912, -5.02122211 48.41461463, -5.02128131 48.41463025, -5.02134044 48.414646, -5.02139949 48.41466188, -5.02145847 48.41467788, -5.02151737 48.414694, -5.02157619 48.41471024, -5.02163494 48.41472661, -5.02169361 48.4147431, -5.0217522 48.41475971, -5.02181071 48.41477644, -5.02186915 48.4147933, -5.0219275 48.41481028, -5.02198577 48.41482738, -5.02204397 48.4148446, -5.02210208 48.41486195, -5.02216011 48.41487941, -5.02221805 48.414897, -5.02227592 48.41491471, -5.0223337 48.41493254, -5.02239139 48.41495049, -5.022449 48.41496856, -5.02250653 48.41498675, -5.02256396 48.41500506, -5.02262132 48.41502349, -5.02267858 48.41504204, -5.02273576 48.41506071, -5.02279285 48.4150795, -5.02284984 48.41509841, -5.02290675 48.41511744, -5.02296357 48.41513659, -5.0230203 48.41515585, -5.02307694 48.41517524, -5.02313349 48.41519474, -5.02318994 48.41521436, -5.0232463 48.4152341, -5.02330257 48.41525395, -5.02335875 48.41527393, -5.02341483 48.41529402, -5.02347081 48.41531423, -5.0235267 48.41533455, -5.02358249 48.41535499, -5.02363819 48.41537555, -5.02369379 48.41539623, -5.02374929 48.41541702, -5.02380469 48.41543793, -5.02385999 48.41545895, -5.0239152 48.41548009, -5.0239703 48.41550134, -5.02402531 48.41552271, -5.02408021 48.41554419, -5.02413501 48.41556579, -5.02418971 48.41558751, -5.02424431 48.41560933, -5.0242988 48.41563127, -5.02435319 48.41565333, -5.02440747 48.4156755, -5.02446165 48.41569778, -5.02451573 48.41572017, -5.0245697 48.41574268, -5.02462356 48.4157653, -5.02467731 48.41578804, -5.02473096 48.41581088, -5.0247845 48.41583384, -5.02483793 48.41585691, -5.02489126 48.41588009, -5.02494447 48.41590338, -5.02499757 48.41592679, -5.02505056 48.4159503, -5.02510344 48.41597393, -5.02515621 48.41599766, -5.02520887 48.41602151, -5.02526141 48.41604547, -5.02531384 48.41606953, -5.02536616 48.41609371, -5.02541836 48.41611799, -5.02547045 48.41614238, -5.02552242 48.41616689, -5.02557428 48.4161915, -5.02562602 48.41621622, -5.02567764 48.41624104, -5.02572915 48.41626598, -5.02578054 48.41629102, -5.02583181 48.41631617, -5.02588296 48.41634143, -5.02593399 48.41636679, -5.0259849 48.41639226, -5.02603569 48.41641784, -5.02608636 48.41644352, -5.02613691 48.41646931, -5.02618734 48.4164952, -5.02623764 48.4165212, -5.02628782 48.41654731, -5.02633788 48.41657352, -5.02638782 48.41659983, -5.02643763 48.41662625, -5.02648731 48.41665277, -5.02653687 48.4166794, -5.02658631 48.41670613, -5.02663561 48.41673296, -5.02668479 48.41675989, -5.02673385 48.41678693, -5.02678277 48.41681407, -5.02683157 48.41684132, -5.02688024 48.41686866, -5.02692878 48.41689611, -5.02697719 48.41692366, -5.02702547 48.4169513, -5.02707362 48.41697905, -5.02712163 48.4170069, -5.02716952 48.41703485, -5.02721727 48.4170629, -5.02726489 48.41709105, -5.02731238 48.4171193, -5.02735974 48.41714765, -5.02740696 48.4171761, -5.02745404 48.41720465, -5.027501 48.41723329, -5.02754781 48.41726203, -5.02759449 48.41729087, -5.02764104 48.41731981, -5.02768744 48.41734885, -5.02773371 48.41737798, -5.02777985 48.41740721, -5.02782584 48.41743653, -5.02787169 48.41746595, -5.02791741 48.41749547, -5.02796299 48.41752508, -5.02800843 48.41755479, -5.02805372 48.41758459, -5.02809888 48.41761449, -5.02814389 48.41764448, -5.02818877 48.41767456, -5.0282335 48.41770474, -5.02827809 48.41773501, -5.02832253 48.41776538, -5.02836683 48.41779583, -5.02841099 48.41782638, -5.028455 48.41785703, -5.02849887 48.41788776, -5.0285426 48.41791859, -5.02858617 48.4179495, -5.02862961 48.41798051, -5.02867289 48.41801161, -5.02871603 48.4180428, -5.02875902 48.41807408, -5.02880186 48.41810545, -5.02884456 48.4181369, -5.02888711 48.41816845, -5.0289295 48.41820009, -5.02897175 48.41823181, -5.02901385 48.41826362, -5.0290558 48.41829552, -5.02909759 48.41832751, -5.02913924 48.41835959, -5.02918073 48.41839175, -5.02922208 48.418424, -5.02926327 48.41845633, -5.0293043 48.41848876, -5.02934519 48.41852126, -5.02938592 48.41855385, -5.02942649 48.41858653, -5.02946692 48.41861929, -5.02950718 48.41865214, -5.0295473 48.41868507, -5.02958725 48.41871808, -5.02962705 48.41875118, -5.0296667 48.41878436, -5.02970619 48.41881762, -5.02974552 48.41885097, -5.02978469 48.4188844, -5.0298237 48.41891791, -5.02986256 48.4189515, -5.02990126 48.41898517, -5.0299398 48.41901892, -5.02997818 48.41905275, -5.0300164 48.41908667, -5.03005446 48.41912066, -5.03009236 48.41915473, -5.0301301 48.41918888, -5.03016767 48.41922311, -5.03020509 48.41925742, -5.03024234 48.41929181, -5.03027943 48.41932627, -5.03031636 48.41936081, -5.03035312 48.41939543, -5.03038972 48.41943013, -5.03042616 48.4194649, -5.03046243 48.41949974, -5.03049854 48.41953467, -5.03053449 48.41956967, -5.03057026 48.41960474, -5.03060588 48.41963989, -5.03064132 48.41967511, -5.0306766 48.41971041, -5.03071172 48.41974578, -5.03074666 48.41978122, -5.03078144 48.41981674, -5.03081605 48.41985233, -5.0308505 48.41988799, -5.03088477 48.41992372, -5.03091888 48.41995952, -5.03095281 48.4199954, -5.03098658 48.42003134, -5.03102018 48.42006736, -5.03105361 48.42010345, -5.03108686 48.4201396, -5.03111995 48.42017583, -5.03115287 48.42021212, -5.03118561 48.42024849, -5.03121818 48.42028492, -5.03125058 48.42032142, -5.03128281 48.42035799, -5.03131486 48.42039462, -5.03134675 48.42043132, -5.03137845 48.42046809, -5.03140999 48.42050492, -5.03144135 48.42054182, -5.03147254 48.42057879, -5.03150355 48.42061582, -5.03153439 48.42065291, -5.03156505 48.42069007, -5.03159553 48.42072729, -5.03162584 48.42076458, -5.03165598 48.42080193, -5.03168594 48.42083934, -5.03171572 48.42087682, -5.03174532 48.42091435, -5.03177475 48.42095195, -5.031804 48.42098961, -5.03183307 48.42102733, -5.03186197 48.42106511, -5.03189068 48.42110295, -5.03191922 48.42114086, -5.03194758 48.42117882, -5.03197575 48.42121684, -5.03200375 48.42125492, -5.03203157 48.42129305, -5.03205921 48.42133125, -5.03208667 48.4213695, -5.03211395 48.42140781, -5.03214105 48.42144618, -5.03216796 48.4214846, -5.0321947 48.42152308, -5.03222125 48.42156162, -5.03224762 48.42160021, -5.03227381 48.42163885, -5.03229981 48.42167755, -5.03232564 48.42171631, -5.03235128 48.42175511, -5.03237673 48.42179398, -5.03240201 48.42183289, -5.0324271 48.42187186, -5.032452 48.42191088, -5.03247672 48.42194995, -5.03250126 48.42198907, -5.03252561 48.42202824, -5.03254978 48.42206747, -5.03257376 48.42210674, -5.03259756 48.42214607, -5.03262117 48.42218544, -5.0326446 48.42222487, -5.03266783 48.42226434, -5.03269089 48.42230386, -5.03271375 48.42234343, -5.03273643 48.42238304, -5.03275892 48.42242271, -5.03278123 48.42246242, -5.03280334 48.42250217, -5.03282527 48.42254198, -5.03284702 48.42258183, -5.03286857 48.42262172, -5.03288993 48.42266166, -5.03291111 48.42270164, -5.0329321 48.42274167, -5.0329529 48.42278174, -5.03297351 48.42282185, -5.03299393 48.42286201, -5.03301416 48.42290221, -5.0330342 48.42294245, -5.03305405 48.42298274, -5.03307371 48.42302306, -5.03309318 48.42306343, -5.03311246 48.42310383, -5.03313155 48.42314428, -5.03315044 48.42318476, -5.03316915 48.42322529, -5.03318766 48.42326585, -5.03320599 48.42330646, -5.03322412 48.4233471, -5.03324206 48.42338777, -5.03325981 48.42342849, -5.03327736 48.42346924, -5.03329473 48.42351003, -5.0333119 48.42355086, -5.03332888 48.42359172, -5.03334566 48.42363261, -5.03336225 48.42367355, -5.03337865 48.42371451, -5.03339486 48.42375551, -5.03341087 48.42379654, -5.03342669 48.42383761, -5.03344231 48.42387871, -5.03345774 48.42391984, -5.03347298 48.42396101, -5.03348802 48.4240022, -5.03350286 48.42404343, -5.03351752 48.42408469, -5.03353197 48.42412598, -5.03354624 48.42416729, -5.0335603 48.42420864, -5.03357418 48.42425002, -5.03358785 48.42429142, -5.03360133 48.42433286, -5.03361462 48.42437432, -5.03362771 48.42441581, -5.0336406 48.42445733, -5.0336533 48.42449887, -5.0336658 48.42454044, -5.03367811 48.42458204, -5.03369022 48.42462366, -5.03370213 48.42466531, -5.03371385 48.42470698, -5.03372537 48.42474867, -5.03373669 48.42479039, -5.03374782 48.42483214, -5.03375875 48.4248739, -5.03376948 48.42491569, -5.03378001 48.4249575, -5.03379035 48.42499933, -5.03380049 48.42504119, -5.03381043 48.42508306, -5.03382017 48.42512496, -5.03382972 48.42516687, -5.03383907 48.42520881, -5.03384822 48.42525077, -5.03385717 48.42529274, -5.03386593 48.42533473, -5.03387448 48.42537674, -5.03388284 48.42541877, -5.033891 48.42546082, -5.03389896 48.42550288, -5.03390672 48.42554496, -5.03391428 48.42558705, -5.03392165 48.42562916, -5.03392882 48.42567129, -5.03393578 48.42571343, -5.03394255 48.42575558, -5.03394912 48.42579775, -5.03395549 48.42583993, -5.03396166 48.42588213, -5.03396763 48.42592434, -5.03397341 48.42596656, -5.03397898 48.42600879, -5.03398435 48.42605103, -5.03398953 48.42609329, -5.0339945 48.42613555, -5.03399928 48.42617783, -5.03400385 48.42622011, -5.03400823 48.42626241, -5.03401241 48.42630471, -5.03401638 48.42634702, -5.03402016 48.42638934, -5.03402374 48.42643167, -5.03402712 48.42647401, -5.03403029 48.42651635, -5.03403327 48.4265587, -5.03403605 48.42660105, -5.03403863 48.42664341, -5.03404101 48.42668577, -5.03404318 48.42672814, -5.03404516 48.42677052, -5.03404694 48.4268129, -5.03404852 48.42685528, -5.0340499 48.42689766, -5.03405107 48.42694005, -5.03405205 48.42698244, -5.03405283 48.42702483, -5.03405341 48.42706722, -5.03405379 48.42710962, -5.03405396 48.42715201, -5.03405394 48.42719441, -5.03405372 48.4272368, -5.03405329 48.4272792, -5.03405267 48.42732159, -5.03405185 48.42736398, -5.03405082 48.42740637, -5.0340496 48.42744876, -5.03404818 48.42749114, -5.03404655 48.42753352, -5.03404473 48.4275759, -5.03404271 48.42761827, -5.03404048 48.42766064, -5.03403806 48.427703, -5.03403544 48.42774536, -5.03403261 48.42778772, -5.03402959 48.42783006, -5.03402637 48.4278724, -5.03402294 48.42791474, -5.03401932 48.42795706, -5.0340155 48.42799938, -5.03401148 48.42804169, -5.03400725 48.42808399, -5.03400283 48.42812628, -5.03399821 48.42816857, -5.03399339 48.42821084, -5.03398837 48.4282531, -5.03398315 48.42829535, -5.03397773 48.4283376, -5.03397211 48.42837982, -5.03396629 48.42842204, -5.03396027 48.42846425, -5.03395406 48.42850644, -5.03394764 48.42854862, -5.03394103 48.42859078, -5.03393421 48.42863294, -5.0339272 48.42867507, -5.03391999 48.42871719, -5.03391258 48.4287593, -5.03390497 48.42880139, -5.03389716 48.42884347, -5.03388915 48.42888552, -5.03388095 48.42892757, -5.03387254 48.42896959, -5.03386394 48.4290116, -5.03385514 48.42905358, -5.03384614 48.42909555, -5.03383695 48.4291375, -5.03382755 48.42917944, -5.03381796 48.42922135, -5.03380817 48.42926324, -5.03379818 48.42930511, -5.033788 48.42934696, -5.03377761 48.42938878, -5.03376703 48.42943059, -5.03375626 48.42947237, -5.03374528 48.42951413, -5.03373411 48.42955587, -5.03372274 48.42959759, -5.03371117 48.42963928, -5.03369941 48.42968094, -5.03368745 48.42972258, -5.0336753 48.4297642, -5.03366294 48.42980579, -5.0336504 48.42984735, -5.03363765 48.42988889, -5.03362471 48.4299304, -5.03361157 48.42997188, -5.03359824 48.43001334, -5.03358471 48.43005477, -5.03357099 48.43009617, -5.03355707 48.43013754, -5.03354296 48.43017888, -5.03352865 48.43022019, -5.03351414 48.43026147, -5.03349944 48.43030272, -5.03348455 48.43034394, -5.03346946 48.43038513, -5.03345418 48.43042628, -5.0334387 48.43046741, -5.03342303 48.4305085, -5.03340717 48.43054956, -5.03339111 48.43059058, -5.03337486 48.43063158, -5.03335841 48.43067253, -5.03334177 48.43071346, -5.03332494 48.43075434, -5.03330791 48.4307952, -5.0332907 48.43083601, -5.03327329 48.43087679, -5.03325568 48.43091754, -5.03323789 48.43095824, -5.0332199 48.43099891, -5.03320172 48.43103954, -5.03318335 48.43108014, -5.03316479 48.43112069, -5.03314603 48.43116121, -5.03312709 48.43120169, -5.03310795 48.43124212, -5.03308862 48.43128252, -5.03306911 48.43132287, -5.0330494 48.43136319, -5.0330295 48.43140346, -5.03300941 48.43144369, -5.03298913 48.43148388, -5.03296866 48.43152403, -5.03294801 48.43156413, -5.03292716 48.43160419, -5.03290612 48.43164421, -5.0328849 48.43168418, -5.03286349 48.43172411, -5.03284189 48.43176399, -5.0328201 48.43180383, -5.03279812 48.43184362, -5.03277595 48.43188337, -5.0327536 48.43192307, -5.03273106 48.43196272, -5.03270833 48.43200232, -5.03268542 48.43204188, -5.03266232 48.43208139, -5.03263903 48.43212085, -5.03261555 48.43216026, -5.03259189 48.43219962, -5.03256805 48.43223894, -5.03254402 48.4322782, -5.0325198 48.43231741, -5.0324954 48.43235657, -5.03247081 48.43239568, -5.03244604 48.43243474, -5.03242109 48.43247375, -5.03239595 48.4325127, -5.03237063 48.4325516, -5.03234512 48.43259045, -5.03231943 48.43262925, -5.03229356 48.43266799, -5.0322675 48.43270667, -5.03224126 48.4327453, -5.03221484 48.43278388, -5.03218824 48.4328224, -5.03216146 48.43286087, -5.03213449 48.43289928, -5.03210735 48.43293763, -5.03208002 48.43297593, -5.03205251 48.43301416, -5.03202482 48.43305235, -5.03199695 48.43309047, -5.0319689 48.43312853, -5.03194067 48.43316654, -5.03191227 48.43320448, -5.03188368 48.43324237, -5.03185491 48.4332802, -5.03182597 48.43331796, -5.03179685 48.43335567, -5.03176755 48.43339331, -5.03173807 48.4334309, -5.03170841 48.43346842, -5.03167858 48.43350588, -5.03164857 48.43354327, -5.03161839 48.43358061, -5.03158802 48.43361788, -5.03155749 48.43365508, -5.03152677 48.43369223, -5.03149589 48.4337293, -5.03146482 48.43376632, -5.03143358 48.43380327, -5.03140217 48.43384015, -5.03137059 48.43387697, -5.03133883 48.43391372, -5.03130689 48.4339504, -5.03127479 48.43398702, -5.03124251 48.43402357, -5.03121006 48.43406005, -5.03117743 48.43409646, -5.03114464 48.43413281, -5.03111167 48.43416909, -5.03107853 48.4342053, -5.03104522 48.43424143, -5.03101175 48.4342775, -5.0309781 48.4343135, -5.03094428 48.43434943, -5.03091029 48.43438529, -5.03087613 48.43442107, -5.0308418 48.43445679, -5.03080731 48.43449243, -5.03077264 48.434528, -5.03073781 48.43456349, -5.03070281 48.43459892, -5.03066765 48.43463427, -5.03063232 48.43466955, -5.03059682 48.43470475, -5.03056115 48.43473988, -5.03052532 48.43477493, -5.03048933 48.43480991, -5.03045316 48.43484482, -5.03041684 48.43487964, -5.03038035 48.4349144, -5.03034369 48.43494907, -5.03030688 48.43498367, -5.0302699 48.43501819, -5.03023275 48.43505263, -5.03019545 48.435087, -5.03015798 48.43512129, -5.03012035 48.4351555, -5.03008256 48.43518963, -5.0300446 48.43522368, -5.03000649 48.43525765, -5.02996822 48.43529154, -5.02992979 48.43532535, -5.02989119 48.43535908, -5.02985244 48.43539273, -5.02981353 48.4354263, -5.02977446 48.43545979, -5.02973524 48.4354932, -5.02969585 48.43552652, -5.02965631 48.43555976, -5.02961661 48.43559292, -5.02957676 48.43562599, -5.02953675 48.43565898, -5.02949658 48.43569189, -5.02945626 48.43572472, -5.02941578 48.43575745, -5.02937515 48.43579011, -5.02933437 48.43582268, -5.02929343 48.43585516, -5.02925234 48.43588756, -5.02921109 48.43591987, -5.0291697 48.4359521, -5.02912815 48.43598423, -5.02908645 48.43601629, -5.0290446 48.43604825, -5.02900259 48.43608013, -5.02896044 48.43611192, -5.02891814 48.43614362, -5.02887569 48.43617523, -5.02883309 48.43620675, -5.02879034 48.43623818, -5.02874744 48.43626953, -5.02870439 48.43630078, -5.0286612 48.43633195, -5.02861786 48.43636302, -5.02857437 48.436394, -5.02853074 48.4364249, -5.02848696 48.4364557, -5.02844304 48.4364864, -5.02839897 48.43651702, -5.02835476 48.43654755, -5.0283104 48.43657798, -5.0282659 48.43660832, -5.02822126 48.43663856, -5.02817647 48.43666871, -5.02813154 48.43669877, -5.02808647 48.43672874, -5.02804126 48.43675861, -5.02799591 48.43678838, -5.02795041 48.43681806, -5.02790478 48.43684765, -5.02785901 48.43687714, -5.0278131 48.43690653, -5.02776705 48.43693583, -5.02772086 48.43696503, -5.02767454 48.43699413, -5.02762807 48.43702314, -5.02758147 48.43705205, -5.02753474 48.43708086, -5.02748787 48.43710958, -5.02744086 48.4371382, -5.02739372 48.43716671, -5.02734644 48.43719513, -5.02729903 48.43722345, -5.02725149 48.43725167, -5.02720381 48.4372798, -5.027156 48.43730782, -5.02710806 48.43733574, -5.02705998 48.43736356, -5.02701178 48.43739128, -5.02696344 48.4374189, -5.02691498 48.43744642, -5.02686638 48.43747384, -5.02681766 48.43750115, -5.02676881 48.43752836, -5.02671983 48.43755548, -5.02667072 48.43758248, -5.02662148 48.43760939, -5.02657212 48.43763619, -5.02652263 48.43766289, -5.02647301 48.43768949, -5.02642327 48.43771598, -5.0263734 48.43774237, -5.02632341 48.43776865, -5.0262733 48.43779483, -5.02622306 48.4378209, -5.0261727 48.43784687, -5.02612222 48.43787273, -5.02607161 48.43789849, -5.02602089 48.43792414, -5.02597004 48.43794969, -5.02591907 48.43797513, -5.02586798 48.43800046, -5.02581678 48.43802568, -5.02576545 48.4380508, -5.02571401 48.43807581, -5.02566245 48.43810072, -5.02561077 48.43812551, -5.02555897 48.4381502, -5.02550706 48.43817478, -5.02545503 48.43819924, -5.02540289 48.43822361, -5.02535063 48.43824786, -5.02529825 48.438272, -5.02524577 48.43829603, -5.02519317 48.43831995, -5.02514045 48.43834377, -5.02508763 48.43836747, -5.02503469 48.43839106, -5.02498165 48.43841454, -5.02492849 48.43843791, -5.02487522 48.43846117, -5.02482184 48.43848432, -5.02476835 48.43850735, -5.02471476 48.43853028, -5.02466105 48.43855309, -5.02460724 48.43857579, -5.02455332 48.43859837, -5.0244993 48.43862085, -5.02444517 48.43864321, -5.02439093 48.43866546, -5.02433659 48.43868759, -5.02428215 48.43870961, -5.0242276 48.43873151, -5.02417295 48.43875331, -5.02411819 48.43877498, -5.02406334 48.43879655, -5.02400838 48.43881799, -5.02395332 48.43883933, -5.02389816 48.43886055, -5.0238429 48.43888165, -5.02378754 48.43890263, -5.02373208 48.43892351, -5.02367653 48.43894426, -5.02362087 48.4389649, -5.02356512 48.43898542, -5.02350927 48.43900583, -5.02345333 48.43902611, -5.02339729 48.43904629, -5.02334115 48.43906634, -5.02328493 48.43908628, -5.0232286 48.4391061, -5.02317219 48.4391258, -5.02311568 48.43914538, -5.02305908 48.43916485, -5.02300238 48.43918419, -5.0229456 48.43920342, -5.02288872 48.43922253, -5.02283176 48.43924152, -5.02277471 48.43926039, -5.02271756 48.43927914, -5.02266033 48.43929777, -5.02260301 48.43931628, -5.02254561 48.43933468, -5.02248811 48.43935295, -5.02243054 48.4393711, -5.02237287 48.43938913, -5.02231512 48.43940704, -5.02225729 48.43942483, -5.02219937 48.4394425, -5.02214137 48.43946005, -5.02208329 48.43947747, -5.02202512 48.43949478, -5.02196688 48.43951196, -5.02190855 48.43952902, -5.02185014 48.43954596, -5.02179166 48.43956278, -5.02173309 48.43957947, -5.02167444 48.43959605, -5.02161572 48.4396125, -5.02155692 48.43962882, -5.02149804 48.43964502, -5.02143909 48.43966111, -5.02138006 48.43967706, -5.02132096 48.4396929, -5.02126178 48.4397086, -5.02120253 48.43972419, -5.0211432 48.43973965, -5.0210838 48.43975499, -5.02102433 48.4397702, -5.02096479 48.43978529, -5.02090517 48.43980026, -5.02084549 48.4398151, -5.02078574 48.43982981, -5.02072591 48.4398444, -5.02066602 48.43985887, -5.02060606 48.43987321, -5.02054604 48.43988742, -5.02048594 48.43990151, -5.02042578 48.43991547, -5.02036556 48.43992931, -5.02030527 48.43994302, -5.02024491 48.43995661, -5.02018449 48.43997006, -5.02012401 48.4399834, -5.02006346 48.4399966, -5.02000286 48.44000968, -5.01994219 48.44002263, -5.01988146 48.44003546, -5.01982067 48.44004816, -5.01975982 48.44006073, -5.01969891 48.44007317, -5.01963794 48.44008549, -5.01957692 48.44009768, -5.01951584 48.44010974, -5.0194547 48.44012167, -5.0193935 48.44013348, -5.01933225 48.44014515, -5.01927095 48.4401567, -5.01920959 48.44016812, -5.01914817 48.44017942, -5.01908671 48.44019058, -5.01902519 48.44020162, -5.01896362 48.44021253, -5.018902 48.4402233, -5.01884032 48.44023395, -5.0187786 48.44024447, -5.01871683 48.44025486, -5.01865501 48.44026513, -5.01859314 48.44027526, -5.01853122 48.44028526, -5.01846926 48.44029514, -5.01840725 48.44030488, -5.0183452 48.4403145, -5.0182831 48.44032398, -5.01822095 48.44033334, -5.01815876 48.44034256, -5.01809653 48.44035166, -5.01803426 48.44036062, -5.01797194 48.44036945, -5.01790958 48.44037816, -5.01784718 48.44038673, -5.01778474 48.44039518, -5.01772226 48.44040349, -5.01765975 48.44041167, -5.01759719 48.44041972, -5.0175346 48.44042764, -5.01747197 48.44043543, -5.0174093 48.44044309, -5.0173466 48.44045062, -5.01728386 48.44045801, -5.01722108 48.44046528, -5.01715828 48.44047241, -5.01709544 48.44047941, -5.01703256 48.44048629, -5.01696966 48.44049302, -5.01690672 48.44049963, -5.01684375 48.44050611, -5.01678075 48.44051245, -5.01671773 48.44051867, -5.01665467 48.44052475, -5.01659158 48.4405307, -5.01652847 48.44053651, -5.01646533 48.4405422, -5.01640216 48.44054775, -5.01633897 48.44055317, -5.01627575 48.44055846, -5.01621251 48.44056362, -5.01614924 48.44056864, -5.01608595 48.44057354, -5.01602264 48.4405783, -5.01595931 48.44058292, -5.01589595 48.44058742, -5.01583257 48.44059178, -5.01576917 48.44059601, -5.01570576 48.44060011, -5.01564232 48.44060407, -5.01557886 48.4406079, -5.01551539 48.4406116, -5.0154519 48.44061517, -5.0153884 48.4406186, -5.01532487 48.44062191, -5.01526134 48.44062507, -5.01519778 48.44062811, -5.01513422 48.44063101, -5.01507064 48.44063378, -5.01500704 48.44063642, -5.01494344 48.44063892, -5.01487982 48.44064129, -5.0148162 48.44064353, -5.01475256 48.44064564, -5.01468891 48.44064761, -5.01462526 48.44064945, -5.01456159 48.44065115, -5.01449792 48.44065272, -5.01443424 48.44065416, -5.01437056 48.44065547, -5.01430686 48.44065664, -5.01424317 48.44065768, -5.01417947 48.44065859, -5.01411576 48.44065936, -5.01405205 48.44066, -5.01398834 48.44066051, -5.01392463 48.44066088, -5.01386091 48.44066112, -5.0137972 48.44066123, -5.01373348 48.4406612, -5.01366977 48.44066104, -5.01360605 48.44066075, -5.01354234 48.44066033, -5.01347863 48.44065977, -5.01341492 48.44065907, -5.01335122 48.44065825, -5.01328752 48.44065729, -5.01322382 48.4406562, -5.01316013 48.44065497, -5.01309645 48.44065362, -5.01303277 48.44065212, -5.0129691 48.4406505, -5.01290544 48.44064874, -5.01284179 48.44064685, -5.01277815 48.44064483, -5.01271451 48.44064267, -5.01265089 48.44064038, -5.01258728 48.44063796, -5.01252368 48.4406354, -5.01246009 48.44063272, -5.01239652 48.44062989, -5.01233296 48.44062694, -5.01226941 48.44062385, -5.01220588 48.44062063, -5.01214236 48.44061728, -5.01207886 48.44061379, -5.01201538 48.44061018, -5.01195191 48.44060642, -5.01188846 48.44060254, -5.01182504 48.44059852, -5.01176163 48.44059437, -5.01169824 48.44059009, -5.01163487 48.44058568, -5.01157152 48.44058113, -5.01150819 48.44057645, -5.01144489 48.44057164, -5.01138161 48.4405667, -5.01131835 48.44056162, -5.01125512 48.44055641, -5.01119191 48.44055107, -5.01112872 48.4405456, -5.01106557 48.44053999, -5.01100244 48.44053426, -5.01093934 48.44052839, -5.01087626 48.44052239, -5.01081322 48.44051626, -5.0107502 48.44050999, -5.01068721 48.4405036, -5.01062426 48.44049707, -5.01056133 48.44049041, -5.01049844 48.44048362, -5.01043558 48.4404767, -5.01037275 48.44046964, -5.01030996 48.44046246, -5.0102472 48.44045514, -5.01018447 48.44044769, -5.01012178 48.44044011, -5.01005913 48.44043241, -5.00999651 48.44042456, -5.00993394 48.44041659, -5.00987139 48.44040849, -5.00980889 48.44040026, -5.00974643 48.44039189, -5.00968401 48.4403834, -5.00962162 48.44037478, -5.00955928 48.44036602, -5.00949698 48.44035714, -5.00943472 48.44034812, -5.00937251 48.44033897, -5.00931033 48.4403297, -5.00924821 48.44032029, -5.00918612 48.44031076, -5.00912409 48.44030109, -5.00906209 48.4402913, -5.00900015 48.44028137, -5.00893825 48.44027132, -5.0088764 48.44026114, -5.0088146 48.44025082, -5.00875285 48.44024038, -5.00869115 48.44022981, -5.00862949 48.44021911, -5.00856789 48.44020828, -5.00850634 48.44019732, -5.00844484 48.44018624, -5.0083834 48.44017502, -5.008322 48.44016368, -5.00826067 48.44015221, -5.00819938 48.44014061, -5.00813815 48.44012888, -5.00807698 48.44011703, -5.00801586 48.44010504, -5.0079548 48.44009293, -5.0078938 48.44008069, -5.00783286 48.44006833, -5.00777197 48.44005583, -5.00771114 48.44004321, -5.00765038 48.44003047, -5.00758967 48.44001759, -5.00752903 48.44000459, -5.00746844 48.43999146, -5.00740792 48.43997821, -5.00734747 48.43996482, -5.00728707 48.43995132, -5.00722674 48.43993768, -5.00716648 48.43992392, -5.00710628 48.43991004, -5.00704614 48.43989602, -5.00698607 48.43988189, -5.00692607 48.43986762, -5.00686614 48.43985323, -5.00680628 48.43983872, -5.00674648 48.43982408, -5.00668675 48.43980932, -5.0066271 48.43979443, -5.00656751 48.43977942, -5.006508 48.43976428, -5.00644855 48.43974902, -5.00638918 48.43973363, -5.00632989 48.43971812, -5.00627066 48.43970249, -5.00621151 48.43968673, -5.00615244 48.43967085, -5.00609344 48.43965484, -5.00603451 48.43963871, -5.00597567 48.43962246, -5.0059169 48.43960609, -5.0058582 48.43958959, -5.00579959 48.43957297, -5.00574105 48.43955623, -5.0056826 48.43953936, -5.00562422 48.43952238, -5.00556593 48.43950527, -5.00550771 48.43948804, -5.00544958 48.43947068, -5.00539153 48.43945321, -5.00533356 48.43943562, -5.00527568 48.4394179, -5.00521787 48.43940006, -5.00516016 48.43938211, -5.00510253 48.43936403, -5.00504498 48.43934583, -5.00498752 48.43932751, -5.00493015 48.43930907, -5.00487287 48.43929051, -5.00481567 48.43927183, -5.00475856 48.43925304, -5.00470154 48.43923412, -5.00464461 48.43921508, -5.00458777 48.43919593, -5.00453103 48.43917665, -5.00447437 48.43915726, -5.0044178 48.43913775, -5.00436133 48.43911812, -5.00430495 48.43909837, -5.00424866 48.43907851, -5.00419247 48.43905852, -5.00413637 48.43903842, -5.00408037 48.43901821, -5.00402447 48.43899787, -5.00396866 48.43897742, -5.00391294 48.43895685, -5.00385733 48.43893617, -5.00380181 48.43891537, -5.00374639 48.43889445, -5.00369107 48.43887342, -5.00363585 48.43885227, -5.00358073 48.43883101, -5.00352571 48.43880963, -5.00347079 48.43878814, -5.00341597 48.43876653, -5.00336126 48.43874481, -5.00330665 48.43872297, -5.00325214 48.43870102, -5.00319773 48.43867896, -5.00314343 48.43865678, -5.00308924 48.43863449, -5.00303515 48.43861209, -5.00298117 48.43858957, -5.00292729 48.43856694, -5.00287352 48.4385442, -5.00281986 48.43852134, -5.00276631 48.43849837, -5.00271286 48.43847529, -5.00265953 48.4384521, -5.0026063 48.4384288, -5.00255318 48.43840539, -5.00250018 48.43838186, -5.00244729 48.43835823, -5.00239451 48.43833448, -5.00234184 48.43831063, -5.00228928 48.43828666, -5.00223684 48.43826259, -5.00218451 48.4382384, -5.0021323 48.43821411, -5.0020802 48.4381897, -5.00202822 48.43816519, -5.00197635 48.43814057, -5.0019246 48.43811584, -5.00187296 48.438091, -5.00182145 48.43806606, -5.00177005 48.43804101, -5.00171877 48.43801585, -5.00166761 48.43799058, -5.00161657 48.43796521, -5.00156565 48.43793973, -5.00151485 48.43791414, -5.00146417 48.43788845, -5.00141361 48.43786265, -5.00136318 48.43783674, -5.00131286 48.43781073, -5.00126267 48.43778462, -5.00121261 48.4377584, -5.00116267 48.43773208, -5.00111285 48.43770565, -5.00106316 48.43767912, -5.00101359 48.43765248, -5.00096415 48.43762574, -5.00091484 48.4375989, -5.00086565 48.43757195, -5.00081659 48.4375449, -5.00076766 48.43751775, -5.00071886 48.4374905, -5.00067018 48.43746314, -5.00062164 48.43743569, -5.00057322 48.43740813, -5.00052494 48.43738047, -5.00047678 48.43735271, -5.00042876 48.43732485, -5.00038087 48.43729689, -5.00033311 48.43726883, -5.00028549 48.43724067, -5.000238 48.43721241, -5.00019064 48.43718405, -5.00014342 48.43715559, -5.00009633 48.43712703, -5.00004937 48.43709838, -5.00000255 48.43706963, -4.99995587 48.43704078, -4.99990932 48.43701183, -4.99986292 48.43698278, -4.99981664 48.43695364, -4.99977051 48.4369244, -4.99972451 48.43689507, -4.99967866 48.43686563, -4.99963294 48.43683611, -4.99958736 48.43680649, -4.99954192 48.43677677, -4.99949663 48.43674696, -4.99945147 48.43671705, -4.99940646 48.43668705, -4.99936158 48.43665695, -4.99931685 48.43662676, -4.99927226 48.43659648, -4.99922782 48.43656611, -4.99918352 48.43653564, -4.99913936 48.43650508, -4.99909535 48.43647443, -4.99905148 48.43644368, -4.99900776 48.43641284, -4.99896419 48.43638192, -4.99892076 48.4363509, -4.99887747 48.43631979, -4.99883434 48.43628859, -4.99879135 48.4362573, -4.99874851 48.43622592, -4.99870582 48.43619445, -4.99866328 48.4361629, -4.99862088 48.43613125, -4.99857864 48.43609951, -4.99853654 48.43606769, -4.9984946 48.43603578, -4.99845281 48.43600378, -4.99841117 48.4359717, -4.99836968 48.43593952, -4.99832834 48.43590726, -4.99828716 48.43587492, -4.99824612 48.43584249, -4.99820525 48.43580997, -4.99816452 48.43577737, -4.99812395 48.43574468, -4.99808353 48.43571191, -4.99804327 48.43567905, -4.99800317 48.43564611, -4.99796322 48.43561309, -4.99792343 48.43557998, -4.99788379 48.43554679, -4.99784431 48.43551352, -4.99780499 48.43548016, -4.99776582 48.43544672, -4.99772681 48.43541321, -4.99768796 48.4353796, -4.99764928 48.43534592, -4.99761075 48.43531216, -4.99757237 48.43527832, -4.99753416 48.43524439, -4.99749611 48.43521039, -4.99745822 48.43517631, -4.9974205 48.43514215, -4.99738293 48.43510791, -4.99734552 48.43507359, -4.99730828 48.43503919, -4.9972712 48.43500472, -4.99723428 48.43497017, -4.99719753 48.43493554, -4.99716094 48.43490084, -4.99712451 48.43486605, -4.99708825 48.4348312, -4.99705216 48.43479626, -4.99701622 48.43476126, -4.99698046 48.43472617, -4.99694486 48.43469101, -4.99690942 48.43465578, -4.99687416 48.43462048, -4.99683906 48.4345851, -4.99680412 48.43454964, -4.99676936 48.43451412, -4.99673476 48.43447852, -4.99670033 48.43444285, -4.99666607 48.43440711, -4.99663198 48.43437129, -4.99659805 48.43433541, -4.9965643 48.43429945, -4.99653072 48.43426343, -4.99649731 48.43422733, -4.99646406 48.43419117, -4.99643099 48.43415493, -4.99639809 48.43411863, -4.99636536 48.43408225, -4.99633281 48.43404581, -4.99630042 48.43400931, -4.99626821 48.43397273, -4.99623617 48.43393609, -4.99620431 48.43389938, -4.99617262 48.4338626, -4.9961411 48.43382576, -4.99610975 48.43378885, -4.99607858 48.43375187, -4.99604759 48.43371484, -4.99601677 48.43367773, -4.99598612 48.43364056, -4.99595566 48.43360333, -4.99592536 48.43356604, -4.99589525 48.43352868, -4.99586531 48.43349126, -4.99583554 48.43345378, -4.99580596 48.43341623, -4.99577655 48.43337862, -4.99574732 48.43334095, -4.99571826 48.43330322, -4.99568939 48.43326544, -4.99566069 48.43322758, -4.99563218 48.43318967, -4.99560384 48.43315171, -4.99557568 48.43311368, -4.9955477 48.43307559, -4.9955199 48.43303744, -4.99549228 48.43299924, -4.99546485 48.43296098, -4.99543759 48.43292266, -4.99541051 48.43288429, -4.99538362 48.43284586, -4.99535691 48.43280737, -4.99533037 48.43276883, -4.99530402 48.43273023, -4.99527786 48.43269157, -4.99525187 48.43265287, -4.99522607 48.4326141, -4.99520045 48.43257529, -4.99517502 48.43253642, -4.99514977 48.4324975, -4.9951247 48.43245852, -4.99509982 48.4324195, -4.99507512 48.43238042, -4.99505061 48.43234129, -4.99502628 48.43230211, -4.99500213 48.43226287, -4.99497817 48.43222359, -4.9949544 48.43218426, -4.99493081 48.43214488, -4.99490741 48.43210545, -4.9948842 48.43206597, -4.99486117 48.43202644, -4.99483833 48.43198687, -4.99481567 48.43194724, -4.99479321 48.43190757, -4.99477093 48.43186785, -4.99474883 48.43182809, -4.99472693 48.43178828, -4.99470521 48.43174843, -4.99468369 48.43170853, -4.99466235 48.43166858, -4.99464119 48.43162859, -4.99462023 48.43158856, -4.99459946 48.43154848, -4.99457888 48.43150836, -4.99455848 48.4314682, -4.99453828 48.43142799, -4.99451826 48.43138774, -4.99449844 48.43134745, -4.99447881 48.43130712, -4.99445936 48.43126675, -4.99444011 48.43122634, -4.99442105 48.43118589, -4.99440218 48.43114539, -4.9943835 48.43110486, -4.99436501 48.43106429, -4.99434671 48.43102368, -4.99432861 48.43098304, -4.9943107 48.43094235, -4.99429298 48.43090163, -4.99427545 48.43086087, -4.99425811 48.43082008, -4.99424097 48.43077925, -4.99422402 48.43073838, -4.99420726 48.43069748, -4.9941907 48.43065655, -4.99417433 48.43061557, -4.99415815 48.43057457, -4.99414217 48.43053353, -4.99412638 48.43049246, -4.99411079 48.43045135, -4.99409539 48.43041022, -4.99408018 48.43036905, -4.99406517 48.43032785, -4.99405035 48.43028662, -4.99403573 48.43024535, -4.9940213 48.43020406, -4.99400706 48.43016274, -4.99399303 48.43012139, -4.99397918 48.43008, -4.99396554 48.43003859, -4.99395208 48.42999716, -4.99393883 48.42995569, -4.99392577 48.4299142, -4.9939129 48.42987267, -4.99390024 48.42983113, -4.99388776 48.42978955, -4.99387549 48.42974795, -4.99386341 48.42970633, -4.99385153 48.42966468, -4.99383984 48.429623, -4.99382835 48.4295813, -4.99381706 48.42953958, -4.99380597 48.42949783, -4.99379507 48.42945606, -4.99378437 48.42941427, -4.99377386 48.42937246, -4.99376356 48.42933062, -4.99375345 48.42928876, -4.99374354 48.42924688, -4.99373383 48.42920499, -4.99372431 48.42916307, -4.99371499 48.42912113, -4.99370587 48.42907917, -4.99369695 48.42903719, -4.99368823 48.4289952, -4.99367971 48.42895318, -4.99367138 48.42891115, -4.99366325 48.42886911, -4.99365532 48.42882704, -4.99364759 48.42878496, -4.99364006 48.42874286, -4.99363273 48.42870075, -4.99362559 48.42865862, -4.99361866 48.42861648, -4.99361192 48.42857432, -4.99360539 48.42853215)))"
        val polygon = wktReader.read(multipolygonString) as MultiPolygon
        val firstMission =
            MissionDTO(
                mission =
                MissionEntity(
                    id = 10,
                    missionTypes = listOf(MissionTypeEnum.LAND),
                    openBy = "KIM",
                    closedBy = "TRA",
                    facade = "NAMO",
                    observationsCacem =
                    "Remain vote several ok. Bring American play woman challenge. Throw low law positive seven.",
                    startDateTimeUtc =
                    ZonedDateTime.parse("2022-03-21T12:11:13Z"),
                    endDateTimeUtc = null,
                    geom = polygon,
                    isClosed = false,
                    isDeleted = false,
                    envActions = listOf(),
                    missionSource = MissionSourceEnum.MONITORENV,
                    hasMissionOrder = false,
                    isUnderJdp = false,
                    controlUnits =
                    listOf(
                        LegacyControlUnitEntity(
                            id = 10002,
                            administration = "DDTM",
                            isArchived = false,
                            name = "DML 2A",
                            resources =
                            listOf(
                                LegacyControlUnitResourceEntity(
                                    id = 3,
                                    controlUnitId =
                                    10002,
                                    name =
                                    "Semi-rigide 1",
                                ),
                                LegacyControlUnitResourceEntity(
                                    id = 4,
                                    controlUnitId =
                                    10002,
                                    name =
                                    "Semi-rigide 2",
                                ),
                                LegacyControlUnitResourceEntity(
                                    id = 5,
                                    controlUnitId =
                                    10002,
                                    name =
                                    "Voiture",
                                ),
                            ),
                        ),
                    ),
                    isGeometryComputedFromControls = false,
                ),
            )
        val mission = jpaMissionRepository.findFullMissionById(10)

        assertThat(mission).isEqualTo(firstMission)
    }

    @Test
    @Transactional
    fun `findFullMissionById Should return specified mission and envActionReportingIds with multiple reportings attached`() {
        // When
        val missionDTO = jpaMissionRepository.findFullMissionById(53)
        assertThat(missionDTO.mission.id).isEqualTo(53)
        assertThat(missionDTO.mission.envActions).hasSize(3)
        assertThat(
            missionDTO.envActionsAttachedToReportingIds?.get(0)?.first,
        )
            .isEqualTo(UUID.fromString("9969413b-b394-4db4-985f-b00743ffb833"))
        assertThat(missionDTO.envActionsAttachedToReportingIds?.get(0)?.second)
            .isEqualTo(listOf(11, 9))
        assertThat(
            missionDTO.envActionsAttachedToReportingIds?.get(1)?.first,
        )
            .isEqualTo(UUID.fromString("3480657f-7845-4eb4-aa06-07b174b1da45"))
        assertThat(missionDTO.envActionsAttachedToReportingIds?.get(1)?.second)
            .isEqualTo(listOf(10))
    }

    @Test
    @Transactional
    fun `findById Should return specified mission and associated env actions and associated envActionReportingIds`() {
        // When
        val missionDTO = jpaMissionRepository.findFullMissionById(34)
        assertThat(missionDTO.mission.id).isEqualTo(34)
        assertThat(missionDTO.mission.envActions).hasSize(2)
        assertThat(
            missionDTO.envActionsAttachedToReportingIds?.get(0)?.first,
        )
            .isEqualTo(UUID.fromString("b8007c8a-5135-4bc3-816f-c69c7b75d807"))
        assertThat(missionDTO.envActionsAttachedToReportingIds?.get(0)?.second).isEqualTo(listOf(6))
    }

    @Test
    @Transactional
    fun `save Should update mission`() {
        // Given
        val wktReader = WKTReader()
        val multipolygonString =
            "MULTIPOLYGON (((-4.54877816747593 48.305559876971, -4.54997332394943 48.3059760121399, -4.54998501370013 48.3071882334181, -4.54879290083417 48.3067746138142, -4.54877816747593 48.305559876971)))"
        val polygon = wktReader.read(multipolygonString) as MultiPolygon
        val infraction =
            InfractionEntity(
                id = UUID.randomUUID().toString(),
                natinf = listOf("53432"),
                observations = "This is an infraction",
                registrationNumber = "REGISTRATION NUM",
                companyName = "ACME inc.",
                relevantCourt = "MARITIME_COURT",
                infractionType = InfractionTypeEnum.WITHOUT_REPORT,
                formalNotice = FormalNoticeEnum.NO,
                toProcess = false,
                controlledPersonIdentity = "Dick Hoover",
                vesselType = VesselTypeEnum.FISHING,
                vesselSize = VesselSizeEnum.FROM_12_TO_24m,
            )
        val controlAction =
            EnvActionControlEntity(
                id = UUID.randomUUID(),
                themes =
                listOf(
                    ThemeEntity(
                        theme = "5",
                        subThemes = listOf("4"),
                        protectedSpecies = listOf("5"),
                    ),
                ),
                observations = "RAS",
                actionNumberOfControls = 12,
                actionTargetType = ActionTargetTypeEnum.VEHICLE,
                vehicleType = VehicleTypeEnum.VESSEL,
                infractions = listOf(infraction),
            )
        val surveillanceAction =
            EnvActionSurveillanceEntity(
                id = UUID.randomUUID(),
                themes =
                listOf(
                    ThemeEntity(
                        theme = "6",
                        subThemes = listOf("7"),
                        protectedSpecies = listOf("8"),
                    ),
                ),
                observations = "This is a surveillance action",
            )
        val noteAction =
            EnvActionNoteEntity(
                id = UUID.randomUUID(),
                observations = "This is a note",
            )

        val missionToUpdate =
            MissionEntity(
                id = 10,
                missionTypes = listOf(MissionTypeEnum.LAND),
                openBy = "John Smith",
                closedBy = "Carol Tim",
                facade = "MEMN",
                geom = polygon,
                observationsCacem = null,
                observationsCnsp = null,
                startDateTimeUtc = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
                endDateTimeUtc = ZonedDateTime.parse("2022-01-23T20:29:03Z"),
                isClosed = false,
                isDeleted = false,
                envActions = listOf(controlAction, surveillanceAction, noteAction),
                missionSource = MissionSourceEnum.MONITORENV,
                hasMissionOrder = false,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
            )
        val expectedUpdatedMission =
            MissionDTO(
                mission =
                MissionEntity(
                    id = 10,
                    missionTypes = listOf(MissionTypeEnum.LAND),
                    openBy = "John Smith",
                    closedBy = "Carol Tim",
                    facade = "MEMN",
                    geom = polygon,
                    observationsCacem = null,
                    observationsCnsp = null,
                    startDateTimeUtc =
                    ZonedDateTime.parse("2022-01-15T04:50:09Z"),
                    endDateTimeUtc =
                    ZonedDateTime.parse("2022-01-23T20:29:03Z"),
                    isClosed = false,
                    isDeleted = false,
                    envActions =
                    listOf(
                        controlAction,
                        surveillanceAction,
                        noteAction,
                    ),
                    missionSource = MissionSourceEnum.MONITORENV,
                    hasMissionOrder = false,
                    isUnderJdp = false,
                    isGeometryComputedFromControls = false,
                ),
            )
        // When
        jpaMissionRepository.save(missionToUpdate)
        assertThat(jpaMissionRepository.findFullMissionById(10)).isEqualTo(expectedUpdatedMission)
    }

    @Test
    @Transactional
    fun `save Should update mission with associated envActions`() {
        // Given
        val wktReader = WKTReader()
        val multipolygonString =
            "MULTIPOLYGON (((-4.54877816747593 48.305559876971, -4.54997332394943 48.3059760121399, -4.54998501370013 48.3071882334181, -4.54879290083417 48.3067746138142, -4.54877816747593 48.305559876971)))"
        val polygon = wktReader.read(multipolygonString) as MultiPolygon

        val envAction =
            EnvActionControlEntity(
                id = UUID.fromString("bf9f4062-83d3-4a85-b89b-76c0ded6473d"),
                actionTargetType = ActionTargetTypeEnum.VEHICLE,
                vehicleType = VehicleTypeEnum.VESSEL,
                actionNumberOfControls = 4,
            )
        val missionToUpdate =
            MissionEntity(
                id = 10,
                missionTypes = listOf(MissionTypeEnum.LAND),
                facade = "NAMO",
                geom = polygon,
                observationsCacem = null,
                observationsCnsp = null,
                startDateTimeUtc = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
                endDateTimeUtc = ZonedDateTime.parse("2022-01-23T20:29:03Z"),
                isClosed = false,
                isDeleted = false,
                envActions = listOf(envAction),
                missionSource = MissionSourceEnum.MONITORENV,
                hasMissionOrder = false,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
            )
        val expectedUpdatedMission =
            MissionDTO(
                mission =
                MissionEntity(
                    id = 10,
                    missionTypes = listOf(MissionTypeEnum.LAND),
                    facade = "NAMO",
                    geom = polygon,
                    observationsCacem = null,
                    observationsCnsp = null,
                    startDateTimeUtc =
                    ZonedDateTime.parse("2022-01-15T04:50:09Z"),
                    endDateTimeUtc =
                    ZonedDateTime.parse("2022-01-23T20:29:03Z"),
                    isClosed = false,
                    isDeleted = false,
                    envActions = listOf(envAction),
                    missionSource = MissionSourceEnum.MONITORENV,
                    hasMissionOrder = false,
                    isUnderJdp = false,
                    isGeometryComputedFromControls = false,
                ),
            )
        // When
        jpaMissionRepository.save(missionToUpdate)
        val updatedMission = jpaMissionRepository.findFullMissionById(10)
        assertThat(updatedMission).isEqualTo(expectedUpdatedMission)
    }

    @Test
    @Transactional
    fun `delete Should set the deleted flag as true`() {
        // Given
        val missionsList =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2022-01-01T10:54:00Z").toInstant(),
                startedBefore = ZonedDateTime.parse("2022-08-08T00:00:00Z").toInstant(),
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                pageable = Pageable.unpaged(),
            )
        assertThat(missionsList).hasSize(21)

        // When
        jpaMissionRepository.delete(3)

        // Then
        val nextMissionList =
            jpaMissionRepository.findAllFullMissions(
                startedAfter = ZonedDateTime.parse("2022-01-01T10:54:00Z").toInstant(),
                startedBefore = ZonedDateTime.parse("2022-08-08T00:00:00Z").toInstant(),
                missionTypes = null,
                missionStatuses = null,
                seaFronts = null,
                pageable = Pageable.unpaged(),
            )
        assertThat(nextMissionList).hasSize(20)
    }

    @Test
    @Transactional
    fun `findByIds() should find the matching missions`() {
        val foundMissions = jpaMissionRepository.findByIds(listOf(50, 51, 52))

        assertThat(foundMissions).hasSize(3)
    }
}
