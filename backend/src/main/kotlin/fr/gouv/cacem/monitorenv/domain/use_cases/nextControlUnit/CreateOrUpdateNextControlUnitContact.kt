package fr.gouv.cacem.monitorenv.domain.use_cases.nextControlUnit

import fr.gouv.cacem.monitorenv.config.UseCase
import fr.gouv.cacem.monitorenv.domain.entities.nextControlUnit.NextControlUnitContactEntity
import fr.gouv.cacem.monitorenv.domain.repositories.INextControlUnitContactRepository

@UseCase
class CreateOrUpdateNextControlUnitContact(private val nextControlUnitContactRepository: INextControlUnitContactRepository) {
    fun execute(nextControlUnitContactEntity: NextControlUnitContactEntity): NextControlUnitContactEntity {
        return nextControlUnitContactRepository.save(nextControlUnitContactEntity)
    }
}
