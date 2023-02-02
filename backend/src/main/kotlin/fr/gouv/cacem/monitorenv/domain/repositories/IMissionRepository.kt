package fr.gouv.cacem.monitorenv.domain.repositories

import fr.gouv.cacem.monitorenv.domain.entities.missions.MissionEntity
import org.springframework.data.domain.Pageable
import java.time.Instant

interface IMissionRepository {
    fun findMissionById(missionId: Int): MissionEntity
    fun findAllMissions(
        startedAfter: Instant,
        startedBefore: Instant?,
        missionNatures: List<String>?,
        missionTypes: List<String>?,
        missionStatuses: List<String>?,
        pageable: Pageable
    ): List<MissionEntity>
    fun save(mission: MissionEntity): MissionEntity
    fun delete(missionId: Int)
    fun count(): Long
}
