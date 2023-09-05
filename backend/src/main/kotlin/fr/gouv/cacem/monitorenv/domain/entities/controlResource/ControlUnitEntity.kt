package fr.gouv.cacem.monitorenv.domain.entities.controlResource

data class ControlUnitEntity(
    val id: Int,
    val administration: String,
    val isArchived: Boolean,
    val name: String,
    val resources: List<ControlResourceEntity>,
    val contact: String? = null,
)