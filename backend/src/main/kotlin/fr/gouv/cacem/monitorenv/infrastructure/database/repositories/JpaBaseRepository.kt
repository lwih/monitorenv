package fr.gouv.cacem.monitorenv.infrastructure.database.repositories

import fr.gouv.cacem.monitorenv.domain.entities.base.BaseEntity
import fr.gouv.cacem.monitorenv.domain.exceptions.NotFoundException
import fr.gouv.cacem.monitorenv.domain.repositories.IBaseRepository
import fr.gouv.cacem.monitorenv.domain.use_cases.base.dtos.FullBaseDTO
import fr.gouv.cacem.monitorenv.infrastructure.database.model.BaseModel
import fr.gouv.cacem.monitorenv.infrastructure.database.repositories.interfaces.IDBNextControlUnitResourceRepository
import fr.gouv.cacem.monitorenv.infrastructure.database.repositories.interfaces.IDBBaseRepository
import fr.gouv.cacem.monitorenv.utils.requirePresent
import org.springframework.dao.InvalidDataAccessApiUsageException
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class JpaBaseRepository(
    private val dbNextControlUnitResourceRepository: IDBNextControlUnitResourceRepository,
    private val dbBaseRepository: IDBBaseRepository,
) : IBaseRepository {
    override fun deleteById(baseId: Int) {
        dbBaseRepository.findById(baseId).get().let { dbBaseRepository.delete(it) }
    }

    override fun findAll(): List<FullBaseDTO> {
        return dbBaseRepository.findAll().map { it.toFullBase() }
    }

    override fun findById(baseId: Int): FullBaseDTO {
        return dbBaseRepository.findById(baseId).get().toFullBase()
    }

    @Transactional
    override fun save(base: BaseEntity): BaseEntity {
        return try {
            val controlUnitResourceModels = base.controlUnitResourceIds.map {
                requirePresent(dbNextControlUnitResourceRepository.findById(it))
            }
            val baseModel = BaseModel.fromBase(base, controlUnitResourceModels)

            dbBaseRepository.save(baseModel).toBase()
        } catch (e: InvalidDataAccessApiUsageException) {
            throw NotFoundException(
                "Unable to find (and update) base with `id` = ${base.id}.",
                e
            )
        }
    }
}
