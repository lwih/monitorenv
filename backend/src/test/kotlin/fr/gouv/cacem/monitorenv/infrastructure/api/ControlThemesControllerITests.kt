package fr.gouv.cacem.monitorenv.infrastructure.api

import fr.gouv.cacem.monitorenv.MeterRegistryConfiguration
import fr.gouv.cacem.monitorenv.domain.entities.controlThemes.ControlThemeEntity
import fr.gouv.cacem.monitorenv.domain.use_cases.crud.controlThemes.*
import fr.gouv.cacem.monitorenv.infrastructure.api.endpoints.ControlThemesController

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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import com.fasterxml.jackson.databind.ObjectMapper

@Import(MeterRegistryConfiguration::class)
@ExtendWith(SpringExtension::class)
@WebMvcTest(value = [(ControlThemesController::class)])
class ControlThemesControllerITests {

  @Autowired
  private lateinit var mockMvc: MockMvc

  @MockBean
  private lateinit var getControlThemes: GetControlThemes

  @MockBean
  private lateinit var getControlThemeById: GetControlThemeById

  @Autowired
  private lateinit var objectMapper: ObjectMapper

  @Test
  fun `Should get all control themes`() {
    // Given

    val controlTheme = ControlThemeEntity(
      id = 1,
      theme_level_1 = "Police des mouillages",
      theme_level_2 = "Mouillage individuel"
    )
    given(this.getControlThemes.execute()).willReturn(listOf(controlTheme))

    // When
    mockMvc.perform(get("/bff/v1/controlthemes"))
      // Then
      .andExpect(status().isOk)
      .andExpect(jsonPath("$[0].id", equalTo(controlTheme.id)))
      .andExpect(jsonPath("$[0].theme_level_1", equalTo(controlTheme.theme_level_1)))
      .andExpect(jsonPath("$[0].theme_level_2", equalTo(controlTheme.theme_level_2)))
  }

  @Test
  fun `Should get specific control theme when requested by Id`() {
    // Given

    val controlTheme = ControlThemeEntity(
      id = 1,
      theme_level_1 = "Police des mouillages",
      theme_level_2 = "Mouillage individuel"
    )

    given(this.getControlThemeById.execute(3)).willReturn(controlTheme)

    // When
    mockMvc.perform(get("/bff/v1/controlthemes/3"))
      // Then
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.id", equalTo(controlTheme.id)))
      .andExpect(jsonPath("$.theme_level_1", equalTo(controlTheme.theme_level_1)))
      .andExpect(jsonPath("$.theme_level_2", equalTo(controlTheme.theme_level_2)))
  }
}