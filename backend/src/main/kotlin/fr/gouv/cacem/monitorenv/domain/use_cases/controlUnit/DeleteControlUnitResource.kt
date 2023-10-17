package fr.gouv.cacem.monitorenv.domain.use_cases.controlUnit

import fr.gouv.cacem.monitorenv.config.UseCase
import fr.gouv.cacem.monitorenv.domain.repositories.IControlUnitResourceRepository

@UseCase
class DeleteControlUnitResource(private val controlUnitResourceRepository: IControlUnitResourceRepository) {
    fun execute(controlUnitResourceId: Int) {
        return controlUnitResourceRepository.deleteById(controlUnitResourceId)
    }
}