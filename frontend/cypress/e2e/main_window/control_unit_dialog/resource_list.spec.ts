import { gotToMainWindowAndOpenControlUnit } from './utils'

context('Main Window > Control Unit Dialog > Resource List', () => {
  beforeEach(() => {
    gotToMainWindowAndOpenControlUnit(10000)
  })

  it('Should show all resources by default', () => {
    cy.contains('Barge – Semi-rigide 1').should('be.visible')
    cy.contains('Barge – Semi-rigide 2').should('be.visible')
  })

  it('Should validate the form', () => {
    cy.clickButton('Ajouter un moyen')

    cy.clickButton('Ajouter')

    cy.contains('Veuillez choisir un type.').should('be.visible')
    cy.contains('Veuillez choisir une base.').should('be.visible')

    cy.clickButton('Annuler')

    cy.get('p').contains('Ajouter un moyen').should('not.exist')
  })

  it('Should add, edit and delete a resource', () => {
    // -------------------------------------------------------------------------
    // Create

    cy.intercept('POST', `/api/v1/control_unit_resources`).as('createControlUnitResource')

    cy.clickButton('Ajouter un moyen')

    cy.fill('Type de moyen', 'Avion')
    // On ne met pas de nom de moyen ici
    // pour tester que ce soit bien le type qui soit utilisé comme nom lorsque le nom est vide.
    cy.fill('Base du moyen', 'Dunkerque')
    cy.fill('Commentaire', 'Un commentaire sur le moyen.')

    cy.clickButton('Ajouter')

    cy.wait('@createControlUnitResource').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        baseId: 3,
        name: 'Avion',
        note: 'Un commentaire sur le moyen.',
        type: 'AIRPLANE'
      })
    })

    cy.get('p').contains('Ajouter un moyen').should('not.exist')
    cy.contains('Avion – Avion').should('be.visible')

    // -------------------------------------------------------------------------
    // Edit

    cy.intercept('PUT', `/api/v1/control_unit_resources/13`).as('updateControlUnitResource')

    cy.getDataCy('ControlUnitDialog-control-unit-resource').filter('[data-id="13"]').clickButton('Éditer ce moyen')

    cy.fill('Type de moyen', 'Bâtiment de soutien')
    cy.fill('Nom du moyen', 'Super Moyen')
    cy.fill('Base du moyen', 'Saint-Malo')
    cy.fill('Commentaire', 'Un autre commentaire sur le moyen.')

    cy.clickButton('Enregistrer les modifications')

    cy.wait('@updateControlUnitResource').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        baseId: 2,
        id: 13,
        name: 'Super Moyen',
        note: 'Un autre commentaire sur le moyen.',
        type: 'SUPPORT_SHIP'
      })
    })

    cy.get('p').contains('Éditer un moyen').should('not.exist')
    cy.contains('Enregistrer les modifications').should('not.exist')
    cy.contains('Bâtiment de soutien – Super Moyen').should('be.visible')

    // -------------------------------------------------------------------------
    // Delete

    cy.intercept('DELETE', `/api/v1/control_unit_resources/13`).as('deleteControlUnitResource')

    cy.getDataCy('ControlUnitDialog-control-unit-resource').filter('[data-id="13"]').clickButton('Éditer ce moyen')
    cy.clickButton('Supprimer ce moyen')
    cy.clickButton('Supprimer')

    cy.wait('@deleteControlUnitResource')

    cy.contains('Bâtiment de soutien – Super Moyen').should('not.exist')
  })
})
