describe('Galactic Mission Control App', () => {
  beforeEach(() => {
    // Intercept API calls to backend
    // Use wildcards to match absolute URLs (http://localhost:3001/...) and query params (?_t=...)
    cy.intercept('GET', '**/api/client_config*', {
      body: { authEnabled: false, domain: '', clientId: '', audience: '', scope: '' }
    }).as('getClientConfig')
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

  it('creates a new project from the homepage', () => {
    cy.intercept('POST', '**/api/projects', {
      body: { success: true, projectId: 'new-project' }
    }).as('createProject')
    // After creation, the app navigates to the new board — intercept that too
    cy.intercept('GET', '**/api/projects/new-project*', {
      body: {
        metadata: { id: 'new-project', name: 'New Project', description: 'Fresh', columns: [] },
        columns: []
      }
    }).as('getNewProject')

    cy.visit('/')
    cy.wait('@getProjects')

    // Click the "New Project" button in the header
    cy.contains('button', 'New Project').click()

    // Fill in the dialog fields (MUI TextFields)
    cy.get('div[role="dialog"]').within(() => {
      cy.get('input').eq(0).clear().type('My New Project')
      cy.get('input').eq(1).clear().type('A fresh project')
      cy.contains('button', 'Create').click()
    })
    cy.wait('@createProject')
  })

  it('creates a task on the board', () => {
    cy.intercept('POST', '**/api/projects/demo-project/tasks', {
      body: { success: true }
    }).as('createTask')

    cy.visit('/board/demo-project')
    cy.wait('@getProjectDetails')

    // Click the add-task button on the first column
    cy.contains('To Do').parents('[data-rfd-droppable-id]').first().within(() => {
      // Look for an add button (+ icon or "Add" text)
      cy.get('button').filter(':contains("+"), [aria-label*="add"], [data-testid*="add"]').first().click({ force: true })
    })
  })

  it('edits a column title inline', () => {
    cy.intercept('PUT', '**/api/projects/demo-project/columns/*', {
      body: { success: true }
    }).as('updateColumn')

    cy.visit('/board/demo-project')
    cy.wait('@getProjectDetails')

    // Click on the column title to start editing
    cy.contains('To Do').click()
    // The title should become an input field — type a new name
    cy.focused().clear().type('Done{enter}')
  })

  it('opens the raw markdown editor for a column', () => {
    cy.visit('/board/demo-project')
    cy.wait('@getProjectDetails')

    // Find the edit button near the "To Do" column
    cy.contains('To Do').parent().find('button, [aria-label*="edit"]').first().click({ force: true })

    // Monaco editor or a textarea should appear with raw markdown
    cy.get('.monaco-editor, textarea').should('exist')
  })
})
