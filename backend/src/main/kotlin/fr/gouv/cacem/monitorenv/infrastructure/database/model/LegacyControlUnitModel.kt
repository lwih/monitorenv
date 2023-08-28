package fr.gouv.cacem.monitorenv.infrastructure.database.model

import com.fasterxml.jackson.annotation.JsonManagedReference
import fr.gouv.cacem.monitorenv.domain.entities.controlUnit.LegacyControlUnitEntity
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToMany
import jakarta.persistence.OneToOne
import jakarta.persistence.Table

@Entity
@Table(name = "legacy_control_units")
data class LegacyControlUnitModel(
    @Id
    @Column(name = "id")
    var id: Int,
    @Column(name = "name")
    var name: String,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "administration_id")
    var administration: AdministrationModel,
    @Column(name = "archived")
    var isArchived: Boolean,
    @OneToMany(
        fetch = FetchType.EAGER,
        mappedBy = "controlUnit",
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
    )
    @JsonManagedReference
    var resources: MutableList<LegacyControlResourceModel>? = ArrayList(),
) {
    fun toLegacyControlUnit() = LegacyControlUnitEntity(
        id = id,
        administration = administration.name,
        isArchived = isArchived,
        name = name,
        resources = resources?.map { it.toControlResource() } ?: listOf(),
    )
}
