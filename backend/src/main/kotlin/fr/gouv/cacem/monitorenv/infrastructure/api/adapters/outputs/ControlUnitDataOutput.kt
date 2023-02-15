package fr.gouv.cacem.monitorenv.infrastructure.api.adapters.outputs

import fr.gouv.cacem.monitorenv.domain.entities.controlResources.ControlUnitEntity

data class ControlUnitDataOutput(
    val id: Int,
    val administration: String,
    val name: String,
    val resources: List<ControlResourceDataOutput>
) {
    companion object {
        fun fromControlUnitEntity(controlUnit: ControlUnitEntity) = ControlUnitDataOutput(
            id = controlUnit.id,
            administration = controlUnit.administration,
            name = controlUnit.name,
            resources = controlUnit.resources.map {
                ControlResourceDataOutput.fromControlResourceEntity(it)
            }
        )
    }
}