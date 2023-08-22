package fr.gouv.cacem.monitorenv.domain.use_cases

import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cacem.monitorenv.domain.entities.VehicleTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.controlResources.ControlUnitEntity
import fr.gouv.cacem.monitorenv.domain.entities.reporting.ReportingEntity
import fr.gouv.cacem.monitorenv.domain.entities.reporting.ReportingTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.reporting.SourceTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.reporting.TargetTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.semaphores.SemaphoreEntity
import fr.gouv.cacem.monitorenv.domain.repositories.IControlUnitRepository
import fr.gouv.cacem.monitorenv.domain.repositories.IFacadeAreasRepository
import fr.gouv.cacem.monitorenv.domain.repositories.IReportingRepository
import fr.gouv.cacem.monitorenv.domain.repositories.ISemaphoreRepository
import fr.gouv.cacem.monitorenv.domain.use_cases.reporting.CreateOrUpdateReporting
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.locationtech.jts.geom.MultiPolygon
import org.locationtech.jts.geom.Point
import org.locationtech.jts.io.WKTReader
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class CreateOrUpdateReportingUTests {
    @MockBean
    private lateinit var createOrUpdateReportingRepositoty: IReportingRepository

    @MockBean
    private lateinit var controlUnitRepository: IControlUnitRepository

    @MockBean
    private lateinit var semaphoreRepository: ISemaphoreRepository

    @MockBean
    private lateinit var facadeRepository: IFacadeAreasRepository

    @Test
    fun `Should throw an exception when input is null`() {
        // When
        val throwable = Assertions.catchThrowable {
            CreateOrUpdateReporting(createOrUpdateReportingRepositoty, controlUnitRepository, semaphoreRepository, facadeRepository)
                .execute(null)
        }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains("No reporting to create or update")
    }

    @Test
    fun `should return new or updated reporting`() {
        // Given
        val wktReader = WKTReader()

        val multipolygonString = "MULTIPOLYGON(((-2.7335 47.6078, -2.7335 47.8452, -3.6297 47.8452, -3.6297 47.6078, -2.7335 47.6078)))"
        val polygon = wktReader.read(multipolygonString) as MultiPolygon
        val point = wktReader.read("POINT(-2.7335 47.6078)") as Point

        val reportingWithSemaphore = ReportingEntity(
            sourceType = SourceTypeEnum.SEMAPHORE,
            semaphoreId = 1,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            seaFront = "Facade 1",
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabal ",
            isInfractionProven = true,
            isControlRequired = true,
            isUnitAvailable = true,
            createdAt = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
            validityTime = 10,
            isArchived = false,
            isDeleted = false,
        )
        val reportingWithControlUnit = ReportingEntity(
            sourceType = SourceTypeEnum.CONTROL_UNIT,
            controlUnitId = 1,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            seaFront = "Facade 1",
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabal ",
            isInfractionProven = true,
            isControlRequired = true,
            isUnitAvailable = true,
            createdAt = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
            validityTime = 10,
            isArchived = false,
            isDeleted = false,
        )

        val semaphore = SemaphoreEntity(
            id = 1,
            name = "semaphore 1",
            geom = point,
        )
        val controlUnit = ControlUnitEntity(
            id = 1,
            name = "control unit 1",
            administration = "administration 1",
            isArchived = false,
            resources = listOf(),
        )

        given(createOrUpdateReportingRepositoty.save(reportingWithSemaphore)).willReturn(reportingWithSemaphore)
        given(createOrUpdateReportingRepositoty.save(reportingWithControlUnit)).willReturn(reportingWithControlUnit)
        given(facadeRepository.findFacadeFromGeometry(polygon)).willReturn("Facade 1")
        given(semaphoreRepository.findById(1)).willReturn(semaphore)
        given(controlUnitRepository.findById(1)).willReturn(controlUnit)

        // When
        val createdReportingWithSemaphore = CreateOrUpdateReporting(createOrUpdateReportingRepositoty, controlUnitRepository, semaphoreRepository, facadeRepository)
            .execute(reportingWithSemaphore)

        // Then
        verify(createOrUpdateReportingRepositoty, times(1)).save(reportingWithSemaphore)
        assertThat(createdReportingWithSemaphore).isEqualTo(Triple(reportingWithSemaphore, null, semaphore))

        // When
        val createdReportingWithControlUnit = CreateOrUpdateReporting(createOrUpdateReportingRepositoty, controlUnitRepository, semaphoreRepository, facadeRepository)
            .execute(reportingWithControlUnit)

        // Then
        verify(createOrUpdateReportingRepositoty, times(1)).save(reportingWithControlUnit)
        assertThat(createdReportingWithControlUnit).isEqualTo(Triple(reportingWithControlUnit, controlUnit, null))
    }

    @Test
    fun`Should throw an exception when sourceType is set to Semaphore and semaphoreId is null or controlUnitId & sourceName are not null`() {
        // Given
        val wktReader = WKTReader()

        val multipolygonString = "MULTIPOLYGON(((-2.7335 47.6078, -2.7335 47.8452, -3.6297 47.8452, -3.6297 47.6078, -2.7335 47.6078)))"
        val polygon = wktReader.read(multipolygonString) as MultiPolygon

        val reporting = ReportingEntity(
            sourceType = SourceTypeEnum.SEMAPHORE,
            controlUnitId = 1,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabal ",
            isInfractionProven = true,
            isControlRequired = true,
            isUnitAvailable = true,
            createdAt = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
            validityTime = 10,
            isArchived = false,
            isDeleted = false,
        )

        // When
        val throwable = Assertions.catchThrowable {
            CreateOrUpdateReporting(createOrUpdateReportingRepositoty, controlUnitRepository, semaphoreRepository, facadeRepository)
                .execute(reporting)
        }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains("SemaphoreId must be set and controlUnitId and sourceName must be null")
    }

    @Test
    fun`Should throw an exception when sourceType is set to ControlUnit and controlUnitId is null or semaphoreId & sourceName are not null`() {
        // Given
        val wktReader = WKTReader()

        val multipolygonString = "MULTIPOLYGON(((-2.7335 47.6078, -2.7335 47.8452, -3.6297 47.8452, -3.6297 47.6078, -2.7335 47.6078)))"
        val polygon = wktReader.read(multipolygonString) as MultiPolygon

        val reporting = ReportingEntity(
            sourceType = SourceTypeEnum.CONTROL_UNIT,
            semaphoreId = 1,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabal ",
            isInfractionProven = true,
            isControlRequired = true,
            isUnitAvailable = true,
            createdAt = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
            validityTime = 10,
            isArchived = false,
            isDeleted = false,
        )

        // When
        val throwable = Assertions.catchThrowable {
            CreateOrUpdateReporting(createOrUpdateReportingRepositoty, controlUnitRepository, semaphoreRepository, facadeRepository)
                .execute(reporting)
        }

        // Then
        assertThat(throwable).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwable.message).contains("ControlUnitId must be set and semaphoreId and sourceName must be null")
    }

    @Test
    fun`should throw an exception if sourceType is set to OTHER and sourceName is null or controlUnitId or SemaphoreId is set`() {
        // Given
        val wktReader = WKTReader()

        val multipolygonString = "MULTIPOLYGON(((-2.7335 47.6078, -2.7335 47.8452, -3.6297 47.8452, -3.6297 47.6078, -2.7335 47.6078)))"
        val polygon = wktReader.read(multipolygonString) as MultiPolygon

        val reportingWithControlUnitId = ReportingEntity(
            sourceType = SourceTypeEnum.OTHER,
            controlUnitId = 1,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabal ",
            isInfractionProven = true,
            isControlRequired = true,
            isUnitAvailable = true,
            createdAt = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
            validityTime = 10,
            isArchived = false,
            isDeleted = false,
        )

        val reportingWithSemaphoreId = ReportingEntity(
            sourceType = SourceTypeEnum.OTHER,
            semaphoreId = 1,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabal ",
            isInfractionProven = true,
            isControlRequired = true,
            isUnitAvailable = true,
            createdAt = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
            validityTime = 10,
            isArchived = false,
            isDeleted = false,
        )
        val reportingWithoutSourceName = ReportingEntity(
            sourceType = SourceTypeEnum.OTHER,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabal ",
            isInfractionProven = true,
            isControlRequired = true,
            isUnitAvailable = true,
            createdAt = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
            validityTime = 10,
            isArchived = false,
            isDeleted = false,
        )

        // When
        val throwableReportingWithControlUnitId = Assertions.catchThrowable {
            CreateOrUpdateReporting(createOrUpdateReportingRepositoty, controlUnitRepository, semaphoreRepository, facadeRepository)
                .execute(reportingWithControlUnitId)
        }

        // Then
        assertThat(throwableReportingWithControlUnitId).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwableReportingWithControlUnitId.message).contains("SourceName must be set and semaphoreId and controlUnitId must be null")
        // When
        val throwableReportingWithSemaphoreId = Assertions.catchThrowable {
            CreateOrUpdateReporting(createOrUpdateReportingRepositoty, controlUnitRepository, semaphoreRepository, facadeRepository)
                .execute(reportingWithSemaphoreId)
        }

        // Then
        assertThat(throwableReportingWithSemaphoreId).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwableReportingWithSemaphoreId.message).contains("SourceName must be set and semaphoreId and controlUnitId must be null")
        // When
        val throwableReportingWithoutSourceName = Assertions.catchThrowable {
            CreateOrUpdateReporting(createOrUpdateReportingRepositoty, controlUnitRepository, semaphoreRepository, facadeRepository)
                .execute(reportingWithoutSourceName)
        }

        // Then
        assertThat(throwableReportingWithoutSourceName).isInstanceOf(IllegalArgumentException::class.java)
        assertThat(throwableReportingWithoutSourceName.message).contains("SourceName must be set and semaphoreId and controlUnitId must be null")
    }
}