package fr.gouv.cacem.monitorenv.infrastructure.database.model

import com.fasterxml.jackson.annotation.JsonManagedReference
import fr.gouv.cacem.monitorenv.domain.entities.base.BaseEntity
import fr.gouv.cacem.monitorenv.domain.use_cases.base.dtos.FullBaseDTO
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant

@Entity
@Table(name = "bases")
data class BaseModel(
    @Id
    @Column(name = "id", nullable = false, unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "base")
    @JsonManagedReference
    var controlUnitResources: List<ControlUnitResourceModel>? = mutableListOf(),

    @Column(name = "latitude", nullable = false)
    var latitude: Double,

    @Column(name = "longitude", nullable = false)
    var longitude: Double,

    @Column(name = "name", nullable = false, unique = true)
    var name: String,

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    @CreationTimestamp
    var createdAtUtc: Instant? = null,

    @Column(name = "updated_at_utc", nullable = false)
    @UpdateTimestamp
    var updatedAtUtc: Instant? = null,
) {
    companion object {
        /**
         * @param controlUnitResourceModels Return control unit resources relations when provided.
         */
        fun fromBase(
            base: BaseEntity,
            controlUnitResourceModels: List<ControlUnitResourceModel>? = null,
        ): BaseModel {
            return BaseModel(
                id = base.id,
                controlUnitResources = controlUnitResourceModels,
                latitude = base.latitude,
                longitude = base.longitude,
                name = base.name,
            )
        }

        /**
         * @param controlUnitResourceModels Return control unit resources relations when provided.
         */
        fun fromFullBase(
            fullBase: FullBaseDTO,
            controlUnitResourceModels: List<ControlUnitResourceModel>? = null,
        ): BaseModel {
            return BaseModel(
                id = fullBase.base.id,
                controlUnitResources = controlUnitResourceModels,
                latitude = fullBase.base.latitude,
                longitude = fullBase.base.longitude,
                name = fullBase.base.name,
            )
        }
    }

    fun toBase(): BaseEntity {
        return BaseEntity(
            id,
            latitude,
            longitude,
            name,
        )
    }

    fun toFullBase(): FullBaseDTO {
        return FullBaseDTO(
            base = toBase(),
            controlUnitResources = requireNotNull(controlUnitResources).map { it.toControlUnitResource() },
        )
    }
}
