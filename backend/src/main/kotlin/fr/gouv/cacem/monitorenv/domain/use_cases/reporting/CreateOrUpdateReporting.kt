package fr.gouv.cacem.monitorenv.domain.use_cases.reporting

import fr.gouv.cacem.monitorenv.config.UseCase
import fr.gouv.cacem.monitorenv.domain.entities.controlResources.ControlUnitEntity
import fr.gouv.cacem.monitorenv.domain.entities.reporting.ReportingEntity
import fr.gouv.cacem.monitorenv.domain.entities.semaphores.SemaphoreEntity
import fr.gouv.cacem.monitorenv.domain.repositories.IControlUnitRepository
import fr.gouv.cacem.monitorenv.domain.repositories.IReportingRepository
import fr.gouv.cacem.monitorenv.domain.repositories.ISemaphoreRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class CreateOrUpdateReporting(
    private val reportingRepository: IReportingRepository,
    private val controlUnitRepository: IControlUnitRepository,
    private val semaphoreRepository: ISemaphoreRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(CreateOrUpdateReporting::class.java)

    @Throws(IllegalArgumentException::class)
    fun execute(reporting: ReportingEntity?): Triple<ReportingEntity, ControlUnitEntity?, SemaphoreEntity?> {
        require(reporting != null) {
            "No reporting to create or update"
        }
        logger.info("Create or update reporting: $reporting.id")
        reporting.checkValidity()
        val savedReport = reportingRepository.save(reporting)

        val controlUnit = if (savedReport.controlUnitId != null) controlUnitRepository.findById(savedReport.controlUnitId) else null
        val semaphore = if (savedReport.semaphoreId != null) semaphoreRepository.findById(savedReport.semaphoreId) else null

        return Triple(savedReport, controlUnit, semaphore)
    }
}
