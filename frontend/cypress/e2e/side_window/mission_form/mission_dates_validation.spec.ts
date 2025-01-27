/// <reference types="cypress" />

context('Mission dates', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)

    cy.visit(`/side_window`).wait(1000)
  })

  it('A mission should be created and closed with surveillances and valid dates', () => {
    // Given
    cy.wait(200)
    cy.get('*[data-cy="add-mission"]').click()

    cy.get('form').submit()
    cy.wait(100)
    cy.get('*[data-cy="mission-errors"]').should('exist')

    // When
    cy.fill('Début de mission (UTC)', [2024, 5, 26, 12, 0])
    cy.fill('Fin de mission (UTC)', [2024, 5, 28, 14, 15])
    cy.get('[name="missionTypes0"]').click({ force: true })
    cy.get('[name="missionTypes1"]').click({ force: true })

    cy.get('*[data-cy="add-control-unit"]').click()
    cy.get('.rs-picker-search-bar-input').type('Cross{enter}')
    cy.get('*[data-cy="control-unit-contact"]').type('Contact 012345')
    cy.wait(200)
    cy.get('*[data-cy="add-control-administration"]').contains('DIRM / DM')
    cy.get('*[data-cy="add-control-unit"]').contains('Cross Etel')

    cy.get('[name="openBy"]').scrollIntoView().type('PCF')
    cy.get('[name="closedBy"]').scrollIntoView().type('PCF')

    // Add a surveillance
    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une surveillance')

    cy.get('*[data-cy="envaction-theme-selector"]').click({ force: true })
    cy.get('*[data-cy="envaction-theme-element"]').contains('Police des espèces protégées').click()
    cy.get('*[data-cy="envaction-subtheme-selector"]').click({ force: true })
    cy.get('*[data-cy="envaction-theme-element"]').contains('Perturbation').click({ force: true })
    cy.get('*[data-cy="envaction-subtheme-selector"]').click('topLeft', { force: true })

    cy.getDataCy('surveillance-duration-matches-mission').should('have.class', 'rs-checkbox-checked')
    cy.get('*[data-cy="surveillance-start-date-time"]')
      .find('[aria-label="Jour"]')
      .invoke('val')
      .then(surveillanceStartDay => {
        cy.getDataCy('mission-start-date-time')
          .find('[aria-label="Jour"]')
          .invoke('val')
          .should('eq', surveillanceStartDay)
      })
    cy.get('*[data-cy="surveillance-start-date-time"]')
      .find('[aria-label="Mois"]')
      .invoke('val')
      .then(surveillanceStartMonth => {
        cy.getDataCy('mission-start-date-time')
          .find('[aria-label="Mois"]')
          .invoke('val')
          .should('eq', surveillanceStartMonth)
      })
    cy.get('*[data-cy="surveillance-start-date-time"]')
      .find('[aria-label="Année"]')
      .invoke('val')
      .then(surveillanceStartYear => {
        cy.getDataCy('mission-start-date-time')
          .find('[aria-label="Année"]')
          .invoke('val')
          .should('eq', surveillanceStartYear)
      })
    cy.get('*[data-cy="surveillance-start-date-time"]')
      .find('[aria-label="Heure"]')
      .invoke('val')
      .then(surveillanceStartHour => {
        cy.getDataCy('mission-start-date-time')
          .find('[aria-label="Heure"]')
          .invoke('val')
          .should('eq', surveillanceStartHour)
      })
    cy.get('*[data-cy="surveillance-start-date-time"]')
      .find('[aria-label="Minute"]')
      .invoke('val')
      .then(surveillanceStartMinute => {
        cy.getDataCy('mission-start-date-time')
          .find('[aria-label="Minute"]')
          .invoke('val')
          .should('eq', surveillanceStartMinute)
      })

    // Add a second surveillance
    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une surveillance')

    cy.get('*[data-cy="envaction-theme-selector"]').click({ force: true })
    cy.get('*[data-cy="envaction-theme-element"]').contains('Police des mouillages').click()
    cy.get('*[data-cy="envaction-subtheme-selector"]').click({ force: true })
    cy.get('*[data-cy="envaction-theme-element"]').contains('ZMEL').click({ force: true })
    cy.get('*[data-cy="envaction-subtheme-selector"]').click('topLeft', { force: true })

    cy.getDataCy('action-card').eq(0).click()
    cy.getDataCy('surveillance-duration-matches-mission').should('not.have.class', 'rs-checkbox-checked')

    // Start date of surveillance is before start date of mission
    cy.fill('Date et heure de début de surveillance (UTC)', [2024, 5, 25, 23, 35])
    cy.clickButton('Enregistrer et clôturer')
    cy.wait(100)
    cy.get('.Element-FieldError').contains('La date de début doit être postérieure à celle de début de mission')

    // Start date of surveillance is after end date of mission
    cy.fill('Date et heure de début de surveillance (UTC)', [2024, 5, 28, 15, 35])
    cy.clickButton('Enregistrer et clôturer')
    cy.wait(100)
    cy.get('.Element-FieldError').contains('La date de début doit être antérieure à celle de fin de mission')

    // Valid start date of surveillance
    cy.fill('Date et heure de début de surveillance (UTC)', [2024, 5, 26, 23, 35])

    // End date of surveillance is before start date of mission
    cy.fill('Date et heure de fin de surveillance (UTC)', [2024, 5, 25, 23, 35])
    cy.clickButton('Enregistrer et clôturer')
    cy.wait(100)
    cy.get('.Element-FieldError').contains('La date de fin doit être postérieure à celle de début de mission')

    // End date of surveillance is after end date of mission
    cy.fill('Date et heure de fin de surveillance (UTC)', [2024, 5, 28, 15, 35])
    cy.clickButton('Enregistrer et clôturer')
    cy.wait(100)
    cy.get('.Element-FieldError').contains('La date de fin doit être antérieure à celle de fin de mission')

    // Valid end date of surveillance
    cy.fill('Date et heure de fin de surveillance (UTC)', [2024, 5, 28, 13, 35])

    // Then
    cy.intercept('PUT', '/bff/v1/missions').as('createAndCloseMission')
    cy.clickButton('Enregistrer et clôturer')
    cy.wait(100)

    cy.wait('@createAndCloseMission').then(({ response }) => {
      expect(response && response.statusCode).equal(200)
    })
  })

  it('A mission should be created with valid dates for control action', () => {
    // Given
    cy.wait(200)
    cy.get('*[data-cy="add-mission"]').click()

    // When
    cy.fill('Début de mission (UTC)', [2024, 5, 26, 12, 0])
    cy.fill('Fin de mission (UTC)', [2024, 5, 28, 14, 15])

    cy.get('[name="missionTypes0"]').click({ force: true })
    cy.get('[name="missionTypes1"]').click({ force: true })

    cy.get('*[data-cy="add-control-unit"]').click()
    cy.get('.rs-picker-search-bar-input').type('Cross{enter}')
    cy.get('*[data-cy="control-unit-contact"]').type('Contact 012345')
    cy.wait(200)
    cy.get('*[data-cy="add-control-administration"]').contains('DIRM / DM')
    cy.get('*[data-cy="add-control-unit"]').contains('Cross Etel')

    cy.get('[name="openBy"]').scrollIntoView().type('PCF')
    cy.get('[name="closedBy"]').scrollIntoView().type('PCF')

    // Add a control
    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter des contrôles')

    cy.get('*[data-cy="envaction-theme-selector"]').click({ force: true })
    cy.get('*[data-cy="envaction-theme-element"]').contains('Police des espèces protégées').click()
    cy.get('*[data-cy="envaction-subtheme-selector"]').click({ force: true })
    cy.get('*[data-cy="envaction-theme-element"]').contains('Perturbation').click({ force: true })
    cy.get('*[data-cy="envaction-theme-element"]').click('topLeft')
    cy.get('*[data-cy="envaction-subtheme-selector"]').click('topLeft', { force: true })

    cy.get('*[data-cy="control-form-number-controls"]').type('{backspace}2')
    cy.fill('Type de cible', 'Personne morale')

    // Date is before start date of mission
    cy.fill('Date et heure du contrôle (UTC)', [2024, 5, 25, 23, 35])

    cy.clickButton('Enregistrer et clôturer')
    cy.wait(100)
    cy.get('.Element-FieldError').contains('La date doit être postérieure à celle de début de mission')

    // Date is after end date of mission
    cy.fill('Date et heure du contrôle (UTC)', [2024, 5, 28, 14, 16])
    cy.clickButton('Enregistrer et clôturer')
    cy.wait(100)
    cy.get('.Element-FieldError').contains('La date doit être antérieure à celle de fin de mission')

    // Valid date
    cy.fill('Date et heure du contrôle (UTC)', [2024, 5, 28, 13, 16])

    // Then
    cy.intercept('PUT', '/bff/v1/missions').as('createAndCloseMission')
    cy.clickButton('Enregistrer et clôturer')
    cy.wait(100)

    cy.wait('@createAndCloseMission').then(({ response }) => {
      expect(response && response.statusCode).equal(200)
    })
  })

  it('save other control actions', () => {
    // Given
    cy.get('*[data-cy="edit-mission-41"]').click({ force: true })
    cy.get('*[data-cy="action-card"]').eq(0).click()

    cy.get('*[data-cy="add-control-administration"]').click()
    cy.get('.rs-picker-search-bar-input').type('DIRM{enter}')

    cy.get('*[data-cy="add-control-unit"]').click()
    cy.get('*[data-key="10080"]').click()
    cy.get('*[data-cy="control-unit-contact"]').type('Contact 012345')

    // When
    cy.fill('Contrôle administratif', false)
    cy.fill('Respect du code de la navigation sur le plan d’eau', false)
    cy.fill('Gens de mer', false)
    cy.fill('Equipement de sécurité et respect des normes', false)

    cy.intercept('PUT', `/bff/v1/missions/41`).as('updateMission')
    cy.clickButton('Enregistrer et quitter')

    // Then
    cy.wait('@updateMission').then(({ request, response }) => {
      expect(response && response.statusCode).equal(200)

      const controlActionRequest = request.body.envActions[0]
      expect(controlActionRequest.isAdministrativeControl).equal(false)
      expect(controlActionRequest.isComplianceWithWaterRegulationsControl).equal(false)
      expect(controlActionRequest.isSeafarersControl).equal(false)
      expect(controlActionRequest.isSafetyEquipmentAndStandardsComplianceControl).equal(false)

      const controlActionResponse = response?.body.envActions[0]
      expect(controlActionResponse.isAdministrativeControl).equal(false)
      expect(controlActionResponse.isComplianceWithWaterRegulationsControl).equal(false)
      expect(controlActionResponse.isSeafarersControl).equal(false)
      expect(controlActionResponse.isSafetyEquipmentAndStandardsComplianceControl).equal(false)
    })

    // Revert
    cy.get('*[data-cy="edit-mission-41"]').click({ force: true })
    cy.get('*[data-cy="action-card"]').eq(0).click()
    cy.fill('Contrôle administratif', true)
    cy.fill('Respect du code de la navigation sur le plan d’eau', true)
    cy.fill('Gens de mer', true)
    cy.fill('Equipement de sécurité et respect des normes', true)
    cy.clickButton('Enregistrer et quitter')
  })
})
