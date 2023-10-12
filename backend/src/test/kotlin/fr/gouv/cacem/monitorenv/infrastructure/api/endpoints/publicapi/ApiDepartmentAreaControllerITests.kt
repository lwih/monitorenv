package fr.gouv.cacem.monitorenv.infrastructure.api.endpoints.publicapi

import fr.gouv.cacem.monitorenv.config.MapperConfiguration
import fr.gouv.cacem.monitorenv.config.WebSecurityConfig
import fr.gouv.cacem.monitorenv.domain.entities.departmentArea.DepartmentAreaEntity
import fr.gouv.cacem.monitorenv.domain.use_cases.departmentArea.GetDepartmentAreaByInseeDep
import fr.gouv.cacem.monitorenv.domain.use_cases.departmentArea.GetDepartmentAreas
import org.hamcrest.Matchers
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(WebSecurityConfig::class, MapperConfiguration::class)
@WebMvcTest(value = [(ApiDepartmentAreasController::class)])
class ApiDepartmentAreaControllerITests {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getDepartmentAreaByInseeDep: GetDepartmentAreaByInseeDep

    @MockBean
    private lateinit var getDepartmentAreas: GetDepartmentAreas

    @Test
    fun `Should get an departmentArea by its ID`() {
        val expectedDepartmentArea = DepartmentAreaEntity(
            inseeDep = "1",
            name = "Department Area Name",
        )

        val requestedId = "1"

        given(getDepartmentAreaByInseeDep.execute(requestedId)).willReturn(expectedDepartmentArea)

        mockMvc.perform(get("/api/v1/department_areas/$requestedId"))
            .andExpect(status().isOk)

        BDDMockito.verify(getDepartmentAreaByInseeDep).execute(requestedId)
    }

    @Test
    fun `Should get all departmentAreas`() {
        val expectedAFulldministrations = listOf(
            DepartmentAreaEntity(
                inseeDep = "1",
                name = "Department Area Name",
            ),

            DepartmentAreaEntity(
                inseeDep = "2",
                name = "Department Area Name 2",
            )
        )

        given(getDepartmentAreas.execute()).willReturn(expectedAFulldministrations)

        mockMvc.perform(get("/api/v1/department_areas"))
            .andExpect(status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$", Matchers.hasSize<Any>(2)))

        BDDMockito.verify(getDepartmentAreas).execute()
    }

}
