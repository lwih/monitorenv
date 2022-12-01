package fr.gouv.cacem.monitorenv.infrastructure.api.endpoints.publicapi

import fr.gouv.cacem.monitorenv.MeterRegistryConfiguration
import fr.gouv.cacem.monitorenv.domain.entities.health.Health
import fr.gouv.cacem.monitorenv.domain.use_cases.healthcheck.GetHealthcheck
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(MeterRegistryConfiguration::class)
@ExtendWith(SpringExtension::class)
@WebMvcTest(value = [(ApiHealthcheckController::class)])
class ApiHealthcheckControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getHealthcheck: GetHealthcheck

    @Test
    fun `Healthcheck returns number of reg areas`() {
        given(this.getHealthcheck.execute()).willReturn(
            Health(numberOfRegulatoryAreas = 13, numberOfMissions = 50)
        )
        mockMvc.perform(get("/api/v1/healthcheck"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("numberOfRegulatoryAreas", equalTo(13)))
            .andExpect(jsonPath("numberOfMissions", equalTo(50)))
    }
}