package fr.gouv.cacem.monitorenv.infrastructure.api.adapters.bff.outputs

import fr.gouv.cacem.monitorenv.domain.entities.VehicleTypeEnum
import fr.gouv.cacem.monitorenv.domain.entities.reporting.*
import fr.gouv.cacem.monitorenv.domain.entities.semaphore.SemaphoreEntity
import fr.gouv.cacem.monitorenv.domain.use_cases.controlUnit.dtos.FullControlUnitDTO
import org.locationtech.jts.geom.Geometry
import java.time.ZonedDateTime
import java.util.UUID

data class ReportingDetailedDataOutput(
    val id: Int,
    val reportingId: Int? = null,
    val sourceType: SourceTypeEnum? = null,
    val semaphoreId: Int? = null,
    val controlUnitId: Int? = null,
    val sourceName: String? = null,
    val displayedSource: String? = null,
    val targetType: TargetTypeEnum? = null,
    val vehicleType: VehicleTypeEnum? = null,
    val targetDetails: List<TargetDetailsEntity>? = listOf(),
    val geom: Geometry? = null,
    val seaFront: String? = null,
    val description: String? = null,
    val reportType: ReportingTypeEnum? = null,
    val theme: String? = null,
    val subThemes: List<String>? = listOf(),
    val actionTaken: String? = null,
    val isControlRequired: Boolean? = null,
    val isUnitAvailable: Boolean? = null,
    val createdAt: ZonedDateTime,
    val validityTime: Int? = null,
    val isArchived: Boolean,
    val openBy: String? = null,
    val attachedMissionId: Int? = null,
    val attachedToMissionAtUtc: ZonedDateTime? = null,
    val detachedFromMissionAtUtc: ZonedDateTime? = null,
    val attachedEnvActionId: UUID? = null,
) {
    companion object {
        fun fromReporting(
            reporting: ReportingEntity,
            fullControlUnit: FullControlUnitDTO?,
            semaphore: SemaphoreEntity?,
        ): ReportingDetailedDataOutput {
            requireNotNull(reporting.id) { "ReportingEntity.id cannot be null" }
            return ReportingDetailedDataOutput(
                id = reporting.id,
                reportingId = reporting.reportingId,
                sourceType = reporting.sourceType,
                semaphoreId = reporting.semaphoreId,
                controlUnitId = reporting.controlUnitId,
                sourceName = reporting.sourceName,
                displayedSource =
                when (reporting.sourceType) {
                    SourceTypeEnum.SEMAPHORE -> semaphore?.unit ?: semaphore?.name
                    // TODO This is really strange : `fullControlUnit?.controlUnit` can't be null and I have to add another `?`...
                    SourceTypeEnum.CONTROL_UNIT -> fullControlUnit?.controlUnit?.name
                    SourceTypeEnum.OTHER -> reporting.sourceName
                    else -> ""
                },
                targetType = reporting.targetType,
                vehicleType = reporting.vehicleType,
                targetDetails = reporting.targetDetails,
                geom = reporting.geom,
                seaFront = reporting.seaFront,
                description = reporting.description,
                reportType = reporting.reportType,
                theme = reporting.theme,
                subThemes = reporting.subThemes,
                actionTaken = reporting.actionTaken,
                isControlRequired = reporting.isControlRequired,
                isUnitAvailable = reporting.isUnitAvailable,
                createdAt = reporting.createdAt,
                validityTime = reporting.validityTime,
                isArchived = reporting.isArchived,
                openBy = reporting.openBy,
                attachedMissionId = reporting.attachedMissionId,
                attachedToMissionAtUtc = reporting.attachedToMissionAtUtc,
                detachedFromMissionAtUtc = reporting.detachedFromMissionAtUtc,
                attachedEnvActionId = reporting.attachedEnvActionId,
            )
        }
    }
}
