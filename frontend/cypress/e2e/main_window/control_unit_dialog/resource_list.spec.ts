import { faker } from '@faker-js/faker'

import { goToMainWindowAndOpenControlUnit } from './utils'

context('Main Window > Control Unit Dialog > Resource List', () => {
  it('Should show all resources by default', () => {
    goToMainWindowAndOpenControlUnit(10000)

    cy.contains('Barge – Semi-rigide 1').should('be.visible')
    cy.contains('Barge – Semi-rigide 2').should('be.visible')
  })

  it('Should validate the form', () => {
    goToMainWindowAndOpenControlUnit(10000)

    cy.clickButton('Ajouter un moyen')

    cy.clickButton('Ajouter')

    cy.contains('Veuillez choisir un type.').should('be.visible')
    cy.contains('Veuillez choisir une base.').should('be.visible')

    cy.clickButton('Annuler')

    cy.get('p').contains('Ajouter un moyen').should('not.exist')
  })

  it('Should show an error dialog when trying to delete a resource linked to some missions', () => {
    goToMainWindowAndOpenControlUnit(10121)

    cy.contains('Frégate – PAM Jeanne Barret')
      .parents('[data-cy="ControlUnitDialog-control-unit-resource"]')
      .clickButton('Éditer ce moyen')
    cy.clickButton('Supprimer ce moyen')

    cy.get('.Component-Dialog').should('be.visible')
    cy.contains('Suppression impossible').should('be.visible')
  })

  it('Should add, edit, archive and delete a resource', () => {
    goToMainWindowAndOpenControlUnit(10000)

    // -------------------------------------------------------------------------
    // Create

    cy.intercept('POST', `/api/v1/control_unit_resources`).as('createControlUnitResource')

    cy.clickButton('Ajouter un moyen')

    // On ne met pas de nom de moyen ici
    // pour tester que ce soit bien le type qui soit utilisé comme nom lorsque le nom est vide.
    const createdResourceName = 'Drône'
    cy.fill('Type de moyen', 'Drône')
    cy.fill('Base du moyen', 'Dunkerque')
    cy.fill('Commentaire', 'Un commentaire sur le moyen.')

    cy.clickButton('Ajouter')

    cy.wait('@createControlUnitResource').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        stationId: 3,
        name: createdResourceName,
        note: 'Un commentaire sur le moyen.',
        type: 'DRONE'
      })
    })

    cy.get('p').contains('Ajouter un moyen').should('not.exist')
    cy.contains(createdResourceName).should('be.visible')

    // -------------------------------------------------------------------------
    // Edit

    cy.intercept('PUT', `/api/v1/control_unit_resources/*`).as('updateControlUnitResource')

    cy.contains(createdResourceName)
      .parents('[data-cy="ControlUnitDialog-control-unit-resource"]')
      .clickButton('Éditer ce moyen')

    const editedResourceName = faker.vehicle.vehicle()
    cy.fill('Type de moyen', 'Voiture')
    cy.fill('Nom du moyen', editedResourceName)
    cy.fill('Base du moyen', 'Saint-Malo')
    cy.fill('Commentaire', 'Un autre commentaire sur le moyen.')

    cy.clickButton('Enregistrer les modifications')

    cy.wait('@updateControlUnitResource').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        stationId: 2,
        name: editedResourceName,
        note: 'Un autre commentaire sur le moyen.',
        type: 'CAR'
      })
    })

    cy.get('p').contains('Éditer un moyen').should('not.exist')
    cy.contains('Enregistrer les modifications').should('not.exist')
    cy.contains(editedResourceName).should('be.visible')

    // -------------------------------------------------------------------------
    // Delete

    cy.intercept('DELETE', `/api/v1/control_unit_resources/*`).as('deleteControlUnitResource')

    cy.contains(editedResourceName)
      .parents('[data-cy="ControlUnitDialog-control-unit-resource"]')
      .clickButton('Éditer ce moyen')
    cy.clickButton('Supprimer ce moyen')
    cy.clickButton('Supprimer')

    cy.wait('@deleteControlUnitResource')

    cy.contains('Bâtiment de soutien – Super Moyen').should('not.exist')
  })

  it('Should add and archive a resource', () => {
    goToMainWindowAndOpenControlUnit(10000)

    // -------------------------------------------------------------------------
    // Create

    cy.intercept('POST', `/api/v1/control_unit_resources`).as('createControlUnitResource')

    cy.clickButton('Ajouter un moyen')

    const newResourceName = faker.vehicle.vehicle()
    cy.fill('Type de moyen', 'Voiture')
    cy.fill('Nom du moyen', newResourceName)
    cy.fill('Base du moyen', 'Dunkerque')
    cy.fill('Commentaire', 'Un commentaire sur le moyen.')

    cy.clickButton('Ajouter')

    cy.wait('@createControlUnitResource').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        stationId: 3,
        name: newResourceName,
        note: 'Un commentaire sur le moyen.',
        type: 'CAR'
      })
    })

    cy.get('p').contains('Ajouter un moyen').should('not.exist')
    cy.contains(newResourceName).should('be.visible')

    // -------------------------------------------------------------------------
    // Archive

    cy.intercept('PUT', `/api/v1/control_unit_resources/*/archive`).as('archiveControlUnitResource')

    cy.contains(newResourceName)
      .parents('[data-cy="ControlUnitDialog-control-unit-resource"]')
      .clickButton('Éditer ce moyen')
    cy.clickButton('Archiver ce moyen')
    cy.clickButton('Archiver')

    cy.wait('@archiveControlUnitResource').then(interception => {
      const archivedResourceId = interception.request.url.split('/')[6]

      cy.contains('Bâtiment de soutien – Super Moyen').should('not.exist')

      // -------------------------------------------------------------------------
      // Reset

      cy.request('DELETE', `/api/v1/control_unit_resources/${archivedResourceId}`)
    })
  })
})
