package fr.gouv.cacem.monitorenv.infrastructure.api.endpoints.bff

import fr.gouv.cacem.monitorenv.domain.use_cases.natinfs.GetNatinfs
import fr.gouv.cacem.monitorenv.infrastructure.api.adapters.outputs.NatinfDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/natinfs")
@Tag(description = "API Natinf", name = "Natinf")
class NatinfsController(
    private val getNatinfs: GetNatinfs
) {

    @GetMapping("")
    @Operation(summary = "Get natinfs")
    fun getNatinfsController(): List<NatinfDataOutput> {
        val natinfs = getNatinfs.execute()

        return natinfs.map { NatinfDataOutput.fromNatinfEntity(it) }
    }
}