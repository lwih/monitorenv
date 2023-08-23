package fr.gouv.cacem.monitorenv.infrastructure.api.endpoints.publicapi

import fr.gouv.cacem.monitorenv.domain.services.ControlUnitService
import fr.gouv.cacem.monitorenv.domain.use_cases.administration.CreateOrUpdateAdministration
import fr.gouv.cacem.monitorenv.domain.use_cases.administration.GetAdministrationById
import fr.gouv.cacem.monitorenv.domain.use_cases.administration.GetAdministrations
import fr.gouv.cacem.monitorenv.infrastructure.api.adapters.publicapi.inputs.CreateOrUpdateAdministrationDataInput
import fr.gouv.cacem.monitorenv.infrastructure.api.adapters.publicapi.outputs.AdministrationDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/administrations")
@Tag(name = "Administrations")
class ApiAdministrationController(
    private val createOrUpdateAdministration: CreateOrUpdateAdministration,
    private val getAdministrations: GetAdministrations,
    private val getAdministrationById: GetAdministrationById,
    private val controlUnitService: ControlUnitService,
) {
    @PostMapping("", consumes = ["application/json"])
    @Operation(summary = "Create an administration")
    fun create(
        @RequestBody
        createAdministrationDataInput: CreateOrUpdateAdministrationDataInput,
    ): AdministrationDataOutput {
        val newAdministrationEntity =
            createAdministrationDataInput.toAdministrationEntity()
        val createdAdministrationEntity =
            createOrUpdateAdministration.execute(newAdministrationEntity)

        return AdministrationDataOutput.fromAdministrationEntity(
            createdAdministrationEntity,
            controlUnitService
        )
    }

    @GetMapping("")
    @Operation(summary = "List administrations")
    fun getAll(): List<AdministrationDataOutput> {
        return getAdministrations.execute()
            .map {
                AdministrationDataOutput.fromAdministrationEntity(
                    it,
                    controlUnitService
                )
            }
    }

    @GetMapping("/{administrationId}")
    @Operation(summary = "Get a administration by its ID")
    fun get(
        @PathParam("Administration ID")
        @PathVariable(name = "administrationId")
        administrationId: Int,
    ): AdministrationDataOutput {
        val foundAdministrationEntity =
            getAdministrationById.execute(administrationId)

        return AdministrationDataOutput.fromAdministrationEntity(
            foundAdministrationEntity,
            controlUnitService
        )
    }

    @PostMapping(value = ["/{administrationId}"], consumes = ["application/json"])
    @Operation(summary = "Update an administration")
    fun update(
        @PathParam("Control unit administration ID")
        @PathVariable(name = "administrationId")
        administrationId: Int,
        @RequestBody
        updateAdministrationDataInput: CreateOrUpdateAdministrationDataInput,
    ): AdministrationDataOutput {
        if ((updateAdministrationDataInput.id == null) || (administrationId != updateAdministrationDataInput.id)) {
            throw java.lang.IllegalArgumentException("Unable to find (and update) administration with ID = ${updateAdministrationDataInput.id}.")
        }

        val nextAdministrationEntity =
            updateAdministrationDataInput.toAdministrationEntity()
        val updatedAdministrationEntity =
            createOrUpdateAdministration.execute(nextAdministrationEntity)

        return AdministrationDataOutput.fromAdministrationEntity(
            updatedAdministrationEntity,
            controlUnitService
        )
    }
}
