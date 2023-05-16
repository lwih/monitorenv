package fr.gouv.cacem.monitorenv.domain.use_cases

import com.nhaarman.mockitokotlin2.*
import fr.gouv.cacem.monitorenv.domain.entities.missions.*
import fr.gouv.cacem.monitorenv.domain.repositories.IFacadeAreasRepository
import fr.gouv.cacem.monitorenv.domain.repositories.IMissionRepository
import fr.gouv.cacem.monitorenv.domain.use_cases.missions.CreateMission
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.context.annotation.Import
import org.springframework.boot.test.mock.mockito.MockBean
import fr.gouv.cacem.monitorenv.config.WebSecurityConfig
import java.time.ZonedDateTime

@Import(WebSecurityConfig::class)
class CreateMissionUTests {

    @MockBean
    private lateinit var missionRepository: IMissionRepository

    @MockBean
    private lateinit var facadeAreasRepository: IFacadeAreasRepository

    @Test
    fun `should create and return a new mission`() {
        // Given
        val expectedCreatedMission = MissionEntity(
            missionTypes = listOf( MissionTypeEnum.LAND),
            facade = "Outre-Mer",
            startDateTimeUtc = ZonedDateTime.parse("2022-01-15T04:50:09Z"),
            endDateTimeUtc = ZonedDateTime.parse("2022-01-23T20:29:03Z"),
            isClosed = false,
            isDeleted = false,
            missionSource = MissionSourceEnum.MONITORENV,
            hasMissionOrder = false,
            isUnderJdp = false
        )
        given(missionRepository.save(expectedCreatedMission)).willReturn(expectedCreatedMission)

        // When
        val createdMission = CreateMission(missionRepository, facadeAreasRepository).execute(expectedCreatedMission)

        // Then
        verify(missionRepository, times(1)).save(expectedCreatedMission)
        assertThat(createdMission).isEqualTo(expectedCreatedMission)
    }
}
