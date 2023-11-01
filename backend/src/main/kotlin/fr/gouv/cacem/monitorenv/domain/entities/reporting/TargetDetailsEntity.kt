package fr.gouv.cacem.monitorenv.domain.entities.reporting

data class TargetDetailsEntity(
    val mmsi: String? = null,
    val imo: String? = null,
    val externalReferenceNumber: String? = null,
    val vesselName: String? = null,
    val operatorName: String? = null,
    val size: Int? = null
)
