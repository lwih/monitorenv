package fr.gouv.cacem.monitorenv.infrastructure.database.repositories

import fr.gouv.cacem.monitorenv.domain.entities.base.BaseEntity
import fr.gouv.cacem.monitorenv.domain.entities.controlUnit.ControlUnitResourceEntity
import fr.gouv.cacem.monitorenv.domain.entities.controlUnit.ControlUnitResourceType
import fr.gouv.cacem.monitorenv.domain.use_cases.base.dtos.FullBaseDTO
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaBaseRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaBaseRepository: JpaBaseRepository

    @Test
    @Transactional
    fun `deleteById() should delete a base by its ID`() {
        val beforeBaseIds = jpaBaseRepository.findAll().map { requireNotNull(it.base.id) }.sorted()

        assertThat(beforeBaseIds).isEqualTo(listOf(0, 1, 2, 3))

        jpaBaseRepository.deleteById(2)

        val afterBaseIds = jpaBaseRepository.findAll().map { requireNotNull(it.base.id) }.sorted()

        assertThat(afterBaseIds).isEqualTo(listOf(0, 1, 3))
    }

    @Test
    @Transactional
    fun `findAll() should find all bases`() {
        val foundFullBases = jpaBaseRepository.findAll().sortedBy { requireNotNull(it.base.id) }

        assertThat(foundFullBases).hasSize(4)

        assertThat(foundFullBases[1]).isEqualTo(
            FullBaseDTO(
                base = BaseEntity(
                    id = 1,
                    name = "Marseille"
                ),
                controlUnitResources = listOf(
                    ControlUnitResourceEntity(
                        id = 1,
                        baseId = 1,
                        controlUnitId = 1,
                        name = "Semi-rigide 1",
                        note = null,
                        photo = null,
                        type = ControlUnitResourceType.BARGE
                    ),
                    ControlUnitResourceEntity(
                        id = 2,
                        baseId = 1,
                        controlUnitId = 1,
                        name = "Semi-rigide 2",
                        note = null,
                        photo = null,
                        type = ControlUnitResourceType.BARGE
                    ),
                ),
            ),
        )

        assertThat(foundFullBases[2]).isEqualTo(
            FullBaseDTO(
                base = BaseEntity(
                    id = 2,
                    name = "Saint-Malo"
                ),
                controlUnitResources = listOf(
                    ControlUnitResourceEntity(
                        id = 3,
                        baseId = 2,
                        controlUnitId = 3,
                        name = "Semi-rigide 1",
                        note = null,
                        photo = null,
                        type = ControlUnitResourceType.BARGE
                    ),
                    ControlUnitResourceEntity(
                        id = 4,
                        baseId = 2,
                        controlUnitId = 3,
                        name = "Semi-rigide 2",
                        note = null,
                        photo = null,
                        type = ControlUnitResourceType.BARGE
                    ),
                    ControlUnitResourceEntity(
                        id = 6,
                        baseId = 2,
                        controlUnitId = 4,
                        name = "AR VECHEN",
                        note = null,
                        photo = null,
                        type = ControlUnitResourceType.FRIGATE
                    ),
                ),
            ),
        )
    }

    @Test
    @Transactional
    fun `findById() should find a base by its ID`() {
        val foundFullBase = jpaBaseRepository.findById(2)

        assertThat(foundFullBase).isEqualTo(
            FullBaseDTO(
                base = BaseEntity(
                    id = 2,
                    name = "Saint-Malo"
                ),
                controlUnitResources = listOf(
                    ControlUnitResourceEntity(
                        id = 3,
                        baseId = 2,
                        controlUnitId = 3,
                        name = "Semi-rigide 1",
                        note = null,
                        photo = null,
                        type = ControlUnitResourceType.BARGE
                    ),
                    ControlUnitResourceEntity(
                        id = 4,
                        baseId = 2,
                        controlUnitId = 3,
                        name = "Semi-rigide 2",
                        note = null,
                        photo = null,
                        type = ControlUnitResourceType.BARGE
                    ),
                    ControlUnitResourceEntity(
                        id = 6,
                        baseId = 2,
                        controlUnitId = 4,
                        name = "AR VECHEN",
                        note = null,
                        photo = null,
                        type = ControlUnitResourceType.FRIGATE
                    ),
                ),
            ),
        )
    }

    @Test
    @Transactional
    fun `save() should create and update a base`() {
        // ---------------------------------------------------------------------
        // Create

        val newBase = BaseEntity(
            name = "Base Name"
        )

        val createdBase = jpaBaseRepository.save(newBase)

        assertThat(createdBase).isEqualTo(newBase.copy(id = 4))

        // ---------------------------------------------------------------------
        // Update

        val nextBase = BaseEntity(
            id = 4,
            name = "Updated Base Name"
        )

        val updatedBase = jpaBaseRepository.save(nextBase)

        assertThat(updatedBase).isEqualTo(nextBase)

        // ---------------------------------------------------------------------
        // Reset

        jpaBaseRepository.deleteById(4)
    }
}
