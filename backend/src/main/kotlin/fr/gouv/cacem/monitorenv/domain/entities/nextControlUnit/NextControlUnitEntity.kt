package fr.gouv.cacem.monitorenv.domain.entities.nextControlUnit

data class NextControlUnitEntity(
    val id: Int? = null,
    /** Area of intervention for this unit. */
    val areaNote: String? = null,
    val controlUnitAdministrationId: Int,
    val controlUnitContactIds: List<Int>,
    val controlUnitResourceIds: List<Int>,
    val isArchived: Boolean,
    val name: String,
    /** Conditions under which this unit should be contacted. */
    val termsNote: String? = null,
)
