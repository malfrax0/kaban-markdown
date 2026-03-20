describe('Galactic Mission Control App', () => {
  beforeEach(() => {
    // Intercept API calls to backend
    // Use wildcards to match absolute URLs (http://localhost:3001/...) and query params (?_t=...)
    cy.intercept('GET', '**/api/projects*', { fixture: 'projects.json' }).as('getProjects')
    cy.intercept('GET', '**/api/projects/demo-project*', { fixture: 'project-details.json' }).as('getProjectDetails')
  })

  it('loads the home page with projects', () => {
    // cy.visit('/') is relative to baseUrl in cypress.config.ts
    cy.visit('/')
    cy.wait('@getProjects')
    
    // Assert header and content
    cy.contains('Galactic Mission Control').should('be.visible')
    cy.contains('Demo Project').should('be.visible')
  })

  it('navigates to board page on project click', () => {
    cy.visit('/')
    cy.wait('@getProjects')
    
    // Find project card and click (assuming card contains the text "Demo Project")
    cy.contains('Demo Project').click()
    
    // URL should update
    cy.url().should('include', '/board/demo-project')
    
    // Wait for board data
    cy.wait('@getProjectDetails')
    
    // Check board elements from fixture
    cy.contains('To Do').should('be.visible')
    cy.contains('On Going').should('be.visible')
    cy.contains('Task 1').should('be.visible')
  })

  it('opens task details modal', () => {
    cy.visit('/board/demo-project')
    cy.wait('@getProjectDetails')

    // Click on a task to open details
    cy.contains('Task 1').click()
    
    // Check modal content (matches fixture/project-details.json)
    cy.contains('First task').should('be.visible')
    
    // Close modal (Escape is a common way, or finding a close button)
    cy.get('body').type('{esc}')
    // Depending on animation, it might take a moment, checking existance
    cy.contains('First task').should('not.exist')
  })
})
