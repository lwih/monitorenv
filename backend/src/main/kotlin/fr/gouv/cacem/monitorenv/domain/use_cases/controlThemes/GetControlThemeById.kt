@file:Suppress("ktlint:standard:package-name")

package fr.gouv.cacem.monitorenv.domain.use_cases.controlThemes

import fr.gouv.cacem.monitorenv.config.UseCase
import fr.gouv.cacem.monitorenv.domain.entities.controlTheme.ControlThemeEntity
import fr.gouv.cacem.monitorenv.domain.repositories.IControlThemeRepository
import org.slf4j.LoggerFactory

@UseCase
class GetControlThemeById(private val controlThemeRepository: IControlThemeRepository) {
    private val logger = LoggerFactory.getLogger(GetControlThemeById::class.java)

    fun execute(controlThemeId: Int): ControlThemeEntity {
        val controlTheme = controlThemeRepository.findById(controlThemeId)

        return controlTheme
    }
}
