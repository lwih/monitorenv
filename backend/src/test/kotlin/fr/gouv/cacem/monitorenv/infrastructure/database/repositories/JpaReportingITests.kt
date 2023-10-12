package fr.gouv.cacem.monitorenv.infrastructure.database.repositories

import fr.gouv.cacem.monitorenv.domain.entities.VehicleTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.reporting.ReportingEntity
import fr.gouv.cacem.monitorenv.domain.entities.reporting.ReportingTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.reporting.SourceTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.reporting.TargetTypeEnum
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.locationtech.jts.geom.MultiPolygon
import org.locationtech.jts.io.WKTReader
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.domain.Pageable
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime
import java.util.UUID

@SpringBootTest(properties = ["monitorenv.scheduling.enable=false"])
class JpaReportingITests : AbstractDBTests() {
    @Autowired private lateinit var jpaReportingRepository: JpaReportingRepository

    @Test
    @Transactional
    fun `save should create a new Reporting`() {
        // Given
        val numberOfExistingReportings = jpaReportingRepository.count()
        assertThat(numberOfExistingReportings).isEqualTo(7)

        // When
        val wktReader = WKTReader()
        val multipolygonString =
            "MULTIPOLYGON (((-4.54877816747593 48.305559876971, -4.54997332394943 48.3059760121399, -4.54998501370013 48.3071882334181, -4.54879290083417 48.3067746138142, -4.54877816747593 48.305559876971)))"
        val polygon = wktReader.read(multipolygonString) as MultiPolygon



        val newReporting =
            ReportingEntity(
                sourceType = SourceTypeEnum.SEMAPHORE,
                semaphoreId = 21,
                targetType = TargetTypeEnum.VEHICLE,
                vehicleType = VehicleTypeEnum.VESSEL,
                geom = polygon,
                seaFront = "NAMO",
                description = "Test reporting",
                reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
                theme = "Police des mouillages",
                subThemes = listOf("ZMEL"),
                actionTaken = "Aucune",
                isControlRequired = false,
                isUnitAvailable = false,
                createdAt = ZonedDateTime.parse("2023-04-01T00:00:00Z"),
                validityTime = 24,
                isArchived = false,
                isDeleted = false,
                openBy = "CDA",
            )
        val createdReporting = jpaReportingRepository.save(newReporting)
        println(createdReporting)
        val reporting = jpaReportingRepository.findById(8)
        println(reporting)

        // Then
        assertThat(createdReporting.id).isNotNull()
        assertThat(createdReporting.reportingId).isNotNull()
        assertThat(createdReporting.sourceType).isEqualTo(SourceTypeEnum.SEMAPHORE)
        assertThat(createdReporting.semaphoreId).isEqualTo(21)
        assertThat(createdReporting.targetType).isEqualTo(TargetTypeEnum.VEHICLE)
        assertThat(createdReporting.vehicleType).isEqualTo(VehicleTypeEnum.VESSEL)
        assertThat(createdReporting.geom).isEqualTo(polygon)
        assertThat(createdReporting.seaFront).isEqualTo("NAMO")
        assertThat(createdReporting.description).isEqualTo("Test reporting")
        assertThat(createdReporting.reportType).isEqualTo(ReportingTypeEnum.INFRACTION_SUSPICION)
        assertThat(createdReporting.theme).isEqualTo("Police des mouillages")
        assertThat(createdReporting.subThemes).isEqualTo(listOf("ZMEL"))
        assertThat(createdReporting.actionTaken).isEqualTo("Aucune")
        assertThat(createdReporting.isControlRequired).isEqualTo(false)
        assertThat(createdReporting.isUnitAvailable).isEqualTo(false)
        assertThat(createdReporting.createdAt).isEqualTo(ZonedDateTime.parse("2023-04-01T00:00:00Z"))
        assertThat(createdReporting.validityTime).isEqualTo(24)
        assertThat(createdReporting.isArchived).isEqualTo(false)
        assertThat(createdReporting.isDeleted).isEqualTo(false)
        assertThat(createdReporting.openBy).isEqualTo("CDA")


        val numberOfExistingReportingsAfterSave = jpaReportingRepository.count()
        assertThat(numberOfExistingReportingsAfterSave).isEqualTo(8)
    }

    @Test
    fun `findById should return specified reporting`() {
        val reporting = jpaReportingRepository.findById(1)
        assertThat(reporting.id).isEqualTo(1)
        assertThat(reporting.reportingId).isEqualTo(2300001)
        assertThat(reporting.sourceType).isEqualTo(SourceTypeEnum.SEMAPHORE)
        assertThat(reporting.semaphoreId).isEqualTo(21)
        assertThat(reporting.controlUnitId).isNull()
        assertThat(reporting.sourceName).isNull()
        assertThat(reporting.targetType).isEqualTo(TargetTypeEnum.VEHICLE)
        assertThat(reporting.vehicleType).isEqualTo(VehicleTypeEnum.VESSEL)
        assertThat(reporting.validityTime).isEqualTo(24)
        assertThat(reporting.isDeleted).isEqualTo(false)
    }

    @Test
    fun `findAll should return all reportings`() {
        val reportings =
            jpaReportingRepository.findAll(
                Pageable.unpaged(),
                startedAfter = ZonedDateTime.parse("2022-01-01T00:01:00Z").toInstant(),
                startedBefore = null,
                reportingType = null,
                seaFronts = null,
                sourcesType = null,
                status = null,
            )
        assertThat(reportings.size).isEqualTo(7)
    }

    @Test
    @Transactional
    fun `save should update an existing Reporting`() {
        // Given
        val numberOfExistingReportings = jpaReportingRepository.count()
        assertThat(numberOfExistingReportings).isEqualTo(7)

        // When
        val existingReporting = jpaReportingRepository.findById(1)
        val updatedReporting =
            existingReporting.copy(
                sourceType = SourceTypeEnum.SEMAPHORE,
                semaphoreId = 23,
                createdAt = ZonedDateTime.parse("2023-04-01T00:00:00Z"),
                isArchived = false,
                isDeleted = false,
                openBy = "CDA",
            )
        val savedReporting = jpaReportingRepository.save(updatedReporting)

        // Then
        assertThat(savedReporting.id).isEqualTo(1)
        assertThat(savedReporting.sourceType).isEqualTo(SourceTypeEnum.SEMAPHORE)
        assertThat(savedReporting.semaphoreId).isEqualTo(23)

        val numberOfExistingReportingsAfterSave = jpaReportingRepository.count()
        assertThat(numberOfExistingReportingsAfterSave).isEqualTo(7)
    }

    @Test
    @Transactional
    fun `archiveReportings should archive multiples reportings`() {
        // Given
        val firstReporting = jpaReportingRepository.findById(2)
        assertThat(firstReporting.isArchived).isEqualTo(false)
        val secondReporting = jpaReportingRepository.findById(3)
        assertThat(secondReporting.isArchived).isEqualTo(false)
        // When
        jpaReportingRepository.archiveReportings(listOf(2, 3))
        // Then
        val firstArchivedReporting = jpaReportingRepository.findById(2)
        assertThat(firstArchivedReporting.isArchived).isEqualTo(true)
        val secondArchivedReporting = jpaReportingRepository.findById(3)
        assertThat(secondArchivedReporting.isArchived).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `delete should soft delete reporting`() {
        // Given
        val numberOfExistingReportings = jpaReportingRepository.count()
        assertThat(numberOfExistingReportings).isEqualTo(7)
        val existingReporting = jpaReportingRepository.findById(1)
        assertThat(existingReporting.isDeleted).isEqualTo(false)
        // When
        jpaReportingRepository.delete(1)

        // Then
        val numberOfExistingReportingsAfterSave = jpaReportingRepository.count()
        assertThat(numberOfExistingReportingsAfterSave).isEqualTo(7)

        val deletedReporting = jpaReportingRepository.findById(1)
        assertThat(deletedReporting.isDeleted).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `archive should archive outdated reporting`() {
        // Given
        val existingReporting = jpaReportingRepository.findById(1)
        assertThat(existingReporting.isArchived).isEqualTo(false)
        // When
        jpaReportingRepository.archiveOutdatedReportings()
        // Then
        val archivedReporting = jpaReportingRepository.findById(1)
        assertThat(archivedReporting.isArchived).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `attach an existing mission to a reporting`() {
        // Given
        val existingReporting = jpaReportingRepository.findById(1)
        assertThat(existingReporting.attachedMissionId).isNull()
        // When

        jpaReportingRepository.save(existingReporting.copy(attachedMissionId = 43, attachedToMissionAtUtc = ZonedDateTime.parse("2023-04-01T00:00:00Z")))

        // Then
        val attachedReporting = jpaReportingRepository.findById(1)
        assertThat(attachedReporting.attachedMissionId).isEqualTo(43)
        assertThat(attachedReporting.attachedToMissionAtUtc).isEqualTo(ZonedDateTime.parse("2023-04-01T00:00:00Z"))
    }

    @Test
    @Transactional
    fun `attach an existing envAction to a reporting`() {
        // Given
        val existingReporting = jpaReportingRepository.findById(1)
        val reportingWithMission = jpaReportingRepository.save(existingReporting.copy(attachedMissionId = 43, attachedToMissionAtUtc = ZonedDateTime.parse("2023-04-01T00:00:00Z")))
        assertThat(reportingWithMission.attachedEnvActionId).isNull()
        // When

        jpaReportingRepository.save(reportingWithMission.copy(attachedEnvActionId = UUID.fromString("74c54cb3-195f-4231-99db-772aebe7a66f")))

        // Then
        val attachedReporting = jpaReportingRepository.findById(1)
        assertThat(attachedReporting.attachedEnvActionId).isEqualTo(UUID.fromString("74c54cb3-195f-4231-99db-772aebe7a66f"))
    }

    @Test
    @Transactional
    fun `an envAction cannot be attached to a reporting without a mission`() {
        // Given
        val existingReporting = jpaReportingRepository.findById(1)
        assertThat(existingReporting.attachedEnvActionId).isNull()
        assertThat(existingReporting.attachedMissionId).isNull()
        // When

        val exception = assertThrows<Exception> {
            val reporting = jpaReportingRepository.save(existingReporting.copy(attachedEnvActionId = UUID.fromString("74c54cb3-195f-4231-99db-772aebe7a66f")))
            println(reporting)
        }

        // Then
        assertThat(exception.message).isEqualTo("An envAction cannot be attach to a reporting without a mission")
    }

    @Test
    @Transactional
    fun `an envAction cannot be attached to a reporting from another mission`() {
        // Given
        val existingReporting = jpaReportingRepository.findById(1)
        assertThat(existingReporting.attachedEnvActionId).isNull()
        assertThat(existingReporting.attachedMissionId).isNull()
        // When

        val exception = assertThrows<Exception> {
            jpaReportingRepository.save(existingReporting.copy(attachedEnvActionId = UUID.fromString("74c54cb3-195f-4231-99db-772aebe7a66f"), attachedMissionId = 42))
        }

        // Then
        println(exception.message)
    }

    @Test
    @Transactional
    fun `a reporting cannot be attached to a non existing mission`() {
        // Given
        val existingReporting = jpaReportingRepository.findById(1)
        assertThat(existingReporting.attachedMissionId).isNull()
        // When
        val exception = assertThrows<Exception> {
            jpaReportingRepository.save(existingReporting.copy(attachedMissionId = 100, attachedToMissionAtUtc = ZonedDateTime.parse("2023-04-01T00:00:00Z")))
        }
        // Then
        println(exception.message)
    }

    @Test
    @Transactional
    fun `a mission cannot be detached from a reporting if an envAction is still attached`() {
        // Given
        val existingReporting = jpaReportingRepository.findById(6)
        assertThat(existingReporting.detachedFromMissionAtUtc).isNull()
        // When
        val exception = assertThrows<Exception> {
            jpaReportingRepository.save(existingReporting.copy(detachedFromMissionAtUtc = ZonedDateTime.parse("2023-04-01T00:00:00Z")))
        }
        // Then
        println(exception.message)
    }
}
