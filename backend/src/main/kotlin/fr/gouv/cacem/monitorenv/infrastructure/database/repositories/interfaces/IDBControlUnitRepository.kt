package fr.gouv.cacem.monitorenv.infrastructure.database.repositories.interfaces

import fr.gouv.cacem.monitorenv.infrastructure.database.model.ControlUnitModel
import org.springframework.data.repository.CrudRepository

interface IDBControlUnitRepository : CrudRepository<ControlUnitModel, Int>