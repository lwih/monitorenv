package fr.gouv.cacem.monitorenv.domain.use_cases.controlUnit

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cacem.monitorenv.domain.entities.base.BaseEntity
import fr.gouv.cacem.monitorenv.domain.entities.controlUnit.ControlUnitEntity
import fr.gouv.cacem.monitorenv.domain.entities.controlUnit.ControlUnitResourceEntity
import fr.gouv.cacem.monitorenv.domain.entities.controlUnit.ControlUnitResourceType
import fr.gouv.cacem.monitorenv.domain.repositories.IControlUnitResourceRepository
import fr.gouv.cacem.monitorenv.domain.use_cases.controlUnit.dtos.FullControlUnitResourceDTO
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetControlUnitResourceByIdUTests {
    @MockBean
    private lateinit var controlUnitResourceRepository: IControlUnitResourceRepository

    @Test
    fun `execute should return a control unit resource by its ID`() {
        val controlUnitResourceId = 1
        val fullControlUnitResource = FullControlUnitResourceDTO(
            base = BaseEntity(
                id = 0,
                latitude = 0.0,
                longitude = 0.0,
                name = "Base Name"
            ),
            controlUnit = ControlUnitEntity(
                id = 0,
                administrationId = 0,
                areaNote = null,
                departmentAreaInseeCode = null,
                isArchived = false,
                name = "Control Unit Name",
                termsNote = null
            ),
            controlUnitResource = ControlUnitResourceEntity(
                id = 1,
                baseId = 0,
                controlUnitId = 0,
                isArchived = false,
                name = "Control Unit Resource Name",
                note = null,
                photo = null,
                type = ControlUnitResourceType.BARGE
            )
        )

        given(controlUnitResourceRepository.findById(controlUnitResourceId)).willReturn(fullControlUnitResource)

        val result = GetControlUnitResourceById(controlUnitResourceRepository).execute(controlUnitResourceId)

        assertThat(result).isEqualTo(fullControlUnitResource)
    }
}
