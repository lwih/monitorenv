package fr.gouv.cacem.monitorenv.infrastructure.api.endpoints.publicapi

import fr.gouv.cacem.monitorenv.domain.use_cases.controlResources.GetAllControlUnits
import fr.gouv.cacem.monitorenv.infrastructure.api.adapters.bff.outputs.ControlUnitDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/control_units")
@Tag(name = "Control Units", description = "API control units")
class ApiControlUnitsController(
    private val getAllControlUnits: GetAllControlUnits,
) {

    @GetMapping("")
    @Operation(summary = "Get control units")
    fun getControlResourcesController(): List<ControlUnitDataOutput> {
        return getAllControlUnits.execute().map { ControlUnitDataOutput.fromControlUnitEntity(it) }
    }
}
