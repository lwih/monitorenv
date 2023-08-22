package fr.gouv.cacem.monitorenv.infrastructure.api.endpoints.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import fr.gouv.cacem.monitorenv.config.MapperConfiguration
import fr.gouv.cacem.monitorenv.config.WebSecurityConfig
import fr.gouv.cacem.monitorenv.domain.entities.VehicleTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.reporting.ReportingEntity
import fr.gouv.cacem.monitorenv.domain.entities.reporting.ReportingTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.reporting.SourceTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.reporting.TargetTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.semaphores.SemaphoreEntity
import fr.gouv.cacem.monitorenv.domain.use_cases.reporting.CreateOrUpdateReporting
import fr.gouv.cacem.monitorenv.domain.use_cases.reporting.DeleteReporting
import fr.gouv.cacem.monitorenv.domain.use_cases.reporting.GetAllReportings
import fr.gouv.cacem.monitorenv.domain.use_cases.reporting.GetReportingById
import fr.gouv.cacem.monitorenv.infrastructure.api.adapters.bff.inputs.CreateOrUpdateReportingDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Point
import org.locationtech.jts.io.WKTReader
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime

@Import(WebSecurityConfig::class, MapperConfiguration::class)
@WebMvcTest(value = [(ReportingsController::class)])
class ReportingsControllerITests {

    @Autowired
    private lateinit var mockedApi: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var createOrUpdateReporting: CreateOrUpdateReporting

    @MockBean
    private lateinit var getAllReportings: GetAllReportings

    @MockBean
    private lateinit var getReportingById: GetReportingById

    @MockBean
    private lateinit var deleteReporting: DeleteReporting

    @Test
    fun `Should create a new Reporting`() {
        // Given
        val polygon = WKTReader().read("MULTIPOLYGON (((-61.0 14.0, -61.0 15.0, -60.0 15.0, -60.0 14.0, -61.0 14.0)))")
        val reporting = ReportingEntity(
            id = 1,
            sourceType = SourceTypeEnum.SEMAPHORE,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            seaFront = "Facade 1",
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabla",
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
            name = "name",
            geom = WKTReader().read("POINT (-61.0 14.0)") as Point,
        )

        val request = CreateOrUpdateReportingDataInput(
            sourceType = SourceTypeEnum.SEMAPHORE,
            semaphoreId = 1,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabla",
            isInfractionProven = true,
            isControlRequired = true,
            isUnitAvailable = true,
            createdAt = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
            validityTime = 10,
            isArchived = false,
        )

        given(createOrUpdateReporting.execute(any())).willReturn(Triple(reporting, null, semaphore))
        // When
        mockedApi.perform(
            put("/bff/v1/reportings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            // Then
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.sourceType").value("SEMAPHORE"))
            .andExpect(jsonPath("$.targetType").value("VEHICLE"))
            .andExpect(jsonPath("$.vehicleType").value("VESSEL"))
            .andExpect(jsonPath("$.geom.type").value("MultiPolygon"))
            .andExpect(jsonPath("$.seaFront").value("Facade 1"))
            .andExpect(jsonPath("$.description").value("description"))
            .andExpect(jsonPath("$.reportType").value("INFRACTION_SUSPICION"))
            .andExpect(jsonPath("$.theme").value("theme"))
            .andExpect(jsonPath("$.subThemes[0]").value("subTheme1"))
            .andExpect(jsonPath("$.subThemes[1]").value("subTheme2"))
            .andExpect(jsonPath("$.actionTaken").value("actions effectuées blabla"))
            .andExpect(jsonPath("$.isInfractionProven").value(true))
            .andExpect(jsonPath("$.isControlRequired").value(true))
            .andExpect(jsonPath("$.isUnitAvailable").value(true))
            .andExpect(jsonPath("$.createdAt").value("2022-01-15T04:50:09Z"))
            .andExpect(jsonPath("$.validityTime").value(10))
            .andExpect(jsonPath("$.isArchived").value(false))
    }

    @Test
    fun `Should return the reporting specified in url`() {
        // Given
        val polygon = WKTReader().read("MULTIPOLYGON (((-61.0 14.0, -61.0 15.0, -60.0 15.0, -60.0 14.0, -61.0 14.0)))")
        val reporting = ReportingEntity(
            id = 1,
            sourceType = SourceTypeEnum.SEMAPHORE,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            seaFront = "Facade 1",
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabla",
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
            name = "name",
            geom = WKTReader().read("POINT (-61.0 14.0)") as Point,
        )

        given(getReportingById.execute(any())).willReturn(Triple(reporting, null, semaphore))

        // When
        mockedApi.perform(
            get("/bff/v1/reportings/1")
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.sourceType").value("SEMAPHORE"))
            .andExpect(jsonPath("$.targetType").value("VEHICLE"))
            .andExpect(jsonPath("$.vehicleType").value("VESSEL"))
            .andExpect(jsonPath("$.geom.type").value("MultiPolygon"))
            .andExpect(jsonPath("$.seaFront").value("Facade 1"))
            .andExpect(jsonPath("$.description").value("description"))
            .andExpect(jsonPath("$.reportType").value("INFRACTION_SUSPICION"))
            .andExpect(jsonPath("$.theme").value("theme"))
            .andExpect(jsonPath("$.subThemes[0]").value("subTheme1"))
            .andExpect(jsonPath("$.subThemes[1]").value("subTheme2"))
            .andExpect(jsonPath("$.actionTaken").value("actions effectuées blabla"))
            .andExpect(jsonPath("$.isInfractionProven").value(true))
            .andExpect(jsonPath("$.isControlRequired").value(true))
            .andExpect(jsonPath("$.isUnitAvailable").value(true))
            .andExpect(jsonPath("$.createdAt").value("2022-01-15T04:50:09Z"))
            .andExpect(jsonPath("$.validityTime").value(10))
            .andExpect(jsonPath("$.isArchived").value(false))
    }

    @Test
    fun `Should return all reportings`() {
        // Given
        val polygon = WKTReader().read("MULTIPOLYGON (((-61.0 14.0, -61.0 15.0, -60.0 15.0, -60.0 14.0, -61.0 14.0)))")
        val reporting = ReportingEntity(
            id = 1,
            sourceType = SourceTypeEnum.SEMAPHORE,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            seaFront = "Facade 1",
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabla",
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
            name = "semaphore name",
            geom = WKTReader().read("POINT (-61.0 14.0)") as Point,
        )
        given(
            getAllReportings.execute(
                pageNumber = anyOrNull(),
                pageSize = anyOrNull(),
            ),
        ).willReturn(listOf(Triple(reporting, null, semaphore)))

        // When
        mockedApi.perform(get("/bff/v1/reportings"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].sourceType").value("SEMAPHORE"))
            .andExpect(jsonPath("$[0].displayedSource").value("semaphore name"))
            .andExpect(jsonPath("$[0].targetType").value("VEHICLE"))
            .andExpect(jsonPath("$[0].vehicleType").value("VESSEL"))
            .andExpect(jsonPath("$[0].geom.type").value("MultiPolygon"))
            .andExpect(jsonPath("$[0].seaFront").value("Facade 1"))
            .andExpect(jsonPath("$[0].description").value("description"))
            .andExpect(jsonPath("$[0].reportType").value("INFRACTION_SUSPICION"))
            .andExpect(jsonPath("$[0].theme").value("theme"))
            .andExpect(jsonPath("$[0].subThemes[0]").value("subTheme1"))
            .andExpect(jsonPath("$[0].subThemes[1]").value("subTheme2"))
            .andExpect(jsonPath("$[0].actionTaken").value("actions effectuées blabla"))
            .andExpect(jsonPath("$[0].isInfractionProven").value(true))
            .andExpect(jsonPath("$[0].isControlRequired").value(true))
            .andExpect(jsonPath("$[0].isUnitAvailable").value(true))
            .andExpect(jsonPath("$[0].createdAt").value("2022-01-15T04:50:09Z"))
            .andExpect(jsonPath("$[0].validityTime").value(10))
            .andExpect(jsonPath("$[0].isArchived").value(false))
    }

    @Test
    fun `Should update a reporting`() {
        // Given
        val polygon = WKTReader().read("MULTIPOLYGON (((-61.0 14.0, -61.0 15.0, -60.0 15.0, -60.0 14.0, -61.0 14.0)))")
        val updatedReporting = ReportingEntity(
            id = 1,
            sourceType = SourceTypeEnum.SEMAPHORE,
            targetType = TargetTypeEnum.VEHICLE,
            vehicleType = VehicleTypeEnum.VESSEL,
            geom = polygon,
            seaFront = "Facade 1",
            description = "description",
            reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
            theme = "theme",
            subThemes = listOf("subTheme1", "subTheme2"),
            actionTaken = "actions effectuées blabla",
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
            name = "name",
            geom = WKTReader().read("POINT (-61.0 14.0)") as Point,
        )
        val updateRequestBody = objectMapper.writeValueAsString(
            CreateOrUpdateReportingDataInput(
                id = 1,
                sourceType = SourceTypeEnum.SEMAPHORE,
                targetType = TargetTypeEnum.VEHICLE,
                vehicleType = VehicleTypeEnum.VESSEL,
                geom = polygon,
                description = "description",
                reportType = ReportingTypeEnum.INFRACTION_SUSPICION,
                theme = "theme",
                subThemes = listOf("subTheme1", "subTheme2"),
                actionTaken = "actions effectuées blabla",
                isInfractionProven = true,
                isControlRequired = true,
                isUnitAvailable = true,
                createdAt = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
                validityTime = 10,
                isArchived = false,
            ),
        )

        given(createOrUpdateReporting.execute(any())).willReturn(Triple(updatedReporting, null, semaphore))

        // When
        mockedApi.perform(
            put("/bff/v1/reportings/1")
                .content(updateRequestBody)
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.sourceType").value("SEMAPHORE"))
            .andExpect(jsonPath("$.targetType").value("VEHICLE"))
            .andExpect(jsonPath("$.vehicleType").value("VESSEL"))
            .andExpect(jsonPath("$.geom.type").value("MultiPolygon"))
            .andExpect(jsonPath("$.seaFront").value("Facade 1"))
            .andExpect(jsonPath("$.description").value("description"))
            .andExpect(jsonPath("$.reportType").value("INFRACTION_SUSPICION"))
            .andExpect(jsonPath("$.theme").value("theme"))
            .andExpect(jsonPath("$.subThemes[0]").value("subTheme1"))
            .andExpect(jsonPath("$.subThemes[1]").value("subTheme2"))
            .andExpect(jsonPath("$.actionTaken").value("actions effectuées blabla"))
            .andExpect(jsonPath("$.isInfractionProven").value(true))
            .andExpect(jsonPath("$.isControlRequired").value(true))
            .andExpect(jsonPath("$.isUnitAvailable").value(true))
            .andExpect(jsonPath("$.createdAt").value("2022-01-15T04:50:09Z"))
            .andExpect(jsonPath("$.validityTime").value(10))
            .andExpect(jsonPath("$.isArchived").value(false))
    }

    @Test
    fun `Should delete a reporting`() {
        // When
        mockedApi.perform(delete("/bff/v1/reportings/123"))
            // Then
            .andExpect(status().isOk)

        Mockito.verify(deleteReporting).execute(123)
    }
}