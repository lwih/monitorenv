package fr.gouv.cacem.monitorenv.infrastructure.database.model

import fr.gouv.cacem.monitorenv.domain.entities.controlTheme.ControlThemeEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "control_themes")
data class ControlThemeModel(
    @Id
    @Column(name = "id")
    val id: Int,
    @Column(name = "theme_level_1")
    val themeLevel1: String,
    @Column(name = "theme_level_2")
    val themeLevel2: String?,
) {
    fun toControlTheme() = ControlThemeEntity(
        id = id,
        themeLevel1 = themeLevel1,
        themeLevel2 = themeLevel2,
    )

    companion object {
        fun fromControlThemeEntity(controlTheme: ControlThemeEntity) = ControlThemeModel(
            id = controlTheme.id,
            themeLevel1 = controlTheme.themeLevel1,
            themeLevel2 = controlTheme.themeLevel2,
        )
    }
}
