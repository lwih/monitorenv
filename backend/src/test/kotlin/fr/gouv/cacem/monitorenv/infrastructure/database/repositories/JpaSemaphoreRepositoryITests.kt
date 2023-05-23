package fr.gouv.cacem.monitorenv.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaSemaphoreRepositoryITests: AbstractDBTests() {
  @Autowired
  private lateinit var jpaSemaphoreRepository: JpaSemaphoreRepository

  @Test
  @Transactional
  fun `findSemaphores Should return all semaphores`() {
    // When
    val semaphores = jpaSemaphoreRepository.findAllSemaphores()
    assertThat(semaphores).hasSize(10)
  }

  @Test
  @Transactional
  fun `findSemaphoreById should return specific semaphore`() {
    // When
    val semaphore = jpaSemaphoreRepository.findSemaphoreById(22)
    // Then
    assertThat(semaphore.id).isEqualTo(22)
    assertThat(semaphore.geom.toString()).isEqualTo("POINT (-3.473888888888889 48.82972222222222)")
    assertThat(semaphore.nom).isEqualTo("SEMAPHORE PLOUMANAC'H")
    assertThat(semaphore.dept).isEqualTo("22")
    assertThat(semaphore.facade).isEqualTo("NAMO")
    assertThat(semaphore.administration).isEqualTo("FOSIT")
    assertThat(semaphore.unite).isEqualTo("Sémaphore de Ploumanac’h")
    assertThat(semaphore.email).isEqualTo("sema@sema.gouv.fr")
    assertThat(semaphore.telephone).isEqualTo("01 23 45 67 89")
    assertThat(semaphore.base).isEqualTo("Ploumana’ch")
  }
}