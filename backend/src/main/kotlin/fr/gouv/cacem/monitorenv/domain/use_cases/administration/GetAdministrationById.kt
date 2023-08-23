package fr.gouv.cacem.monitorenv.domain.use_cases.administration

import fr.gouv.cacem.monitorenv.config.UseCase
import fr.gouv.cacem.monitorenv.domain.entities.administration.AdministrationEntity
import fr.gouv.cacem.monitorenv.domain.repositories.IAdministrationRepository

@UseCase
class GetAdministrationById(private val administrationRepository: IAdministrationRepository) {
    fun execute(administrationId: Int): AdministrationEntity {
        return administrationRepository.findById(administrationId)
    }
}
