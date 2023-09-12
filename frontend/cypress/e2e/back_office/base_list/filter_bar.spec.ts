context('Back Office > Base List > Filter Bar', () => {
  beforeEach(() => {
    cy.intercept('GET', `/api/v1/bases`).as('getBases')

    cy.visit(`/backoffice/bases`)

    cy.wait('@getBases')
  })

  it('Should show all bases by default', () => {
    cy.get('tbody > tr').should('have.length', 2)
    cy.get('tbody > tr:first-child > td:nth-child(2)').should('have.text', 'Marseille')
    cy.get('tbody > tr:last-child > td:nth-child(2)').should('have.text', 'Saint-Malo')
  })

  it('Should find bases matching the search query', () => {
    cy.fill('Rechercher...', 'mar')

    cy.get('tbody > tr').should('have.length', 1)
    cy.get('tbody > tr:first-child > td:nth-child(2)').should('have.text', 'Marseille')
  })
})
