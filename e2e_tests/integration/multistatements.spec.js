/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global Cypress, cy, test, expect, before, after */

describe('Multi statements', () => {
  const validQuery = 'RETURN 1; :config; RETURN 2;'

  before(() => {
    cy.get('[data-test-id="drawerSettings"]').click()
    cy.get('[data-test-id="enableMultiStatementMode"]').click()
    cy.get('[data-test-id="drawerSettings"]').click()
  })
  after(() => {
    cy.get('[data-test-id="drawerSettings"]').click()
    cy.get('[data-test-id="enableMultiStatementMode"]').click()
    cy.get('[data-test-id="drawerSettings"]').click()
  })
  it('can connect', () => {
    const password = Cypress.env('browser-password') || 'newpassword'
    cy.connect(
      'neo4j',
      password
    )
  })
  it('can run multiple statements (non open by default)', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(validQuery)
    cy.get('[data-test-id="frame"]', { timeout: 10000 }).should(
      'have.length',
      1
    )
    const frame = cy.get('[data-test-id="frame"]', { timeout: 10000 }).first()
    frame.get('[data-test-id="multi-statement-list"]').should('have.length', 1)
    frame
      .get('[data-test-id="multi-statement-list-title"]')
      .should('have.length', 3)
    frame
      .get('[data-test-id="multi-statement-list-content"]')
      .should('have.length', 0)
  })

  it('can force run multiple statements to be executed as one statement', () => {
    // Given
    cy.executeCommand(':clear')
    cy.get('[data-test-id="drawerSettings"]').click()
    cy.get('[data-test-id="enableMultiStatementMode"]').click()
    cy.get('[data-test-id="drawerSettings"]').click()

    // When
    cy.executeCommand(validQuery)
    cy.waitForCommandResult()

    // Then
    // Error expected
    cy.get('[data-test-id="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', validQuery)
    cy.get('[data-test-id="frameStatusbar"]', { timeout: 10000 })
      .first()
      .should('contain', 'Error')

    cy.get('[data-test-id="drawerSettings"]').click()
    cy.get('[data-test-id="enableMultiStatementMode"]').click()
    cy.get('[data-test-id="drawerSettings"]').click()
  })

  it('can run multiple statements with error open', () => {
    cy.executeCommand(':clear')
    const query = 'RETURN 1; RETURN $nonsetparam; RETURN 2;'
    cy.executeCommand(query)
    cy.get('[data-test-id="frame"]', { timeout: 10000 }).should(
      'have.length',
      1
    )
    const frame = cy.get('[data-test-id="frame"]', { timeout: 10000 }).first()
    frame.find('[data-test-id="multi-statement-list"]').should('have.length', 1)
    frame
      .get('[data-test-id="multi-statement-list-title"]')
      .should('have.length', 3)
    frame
      .get('[data-test-id="multi-statement-list-content"]', { timeout: 10000 })
      .should('have.length', 1)
    frame
      .get('[data-test-id="multi-statement-list-content"]', { timeout: 10000 })
      .first()
      .should('contain', 'ERROR')
  })
  it('Takes any statements (not just valid cypher and client commands)', () => {
    cy.executeCommand(':clear')
    const query = 'RETURN 1; hello1; RETURN 2; hello2;'
    cy.executeCommand(query)
    cy.get('[data-test-id="frame"]', { timeout: 10000 }).should(
      'have.length',
      1
    )
    const frame = cy.get('[data-test-id="frame"]', { timeout: 10000 }).first()
    frame.find('[data-test-id="multi-statement-list"]').should('have.length', 1)
    frame
      .get('[data-test-id="multi-statement-list-title"]')
      .should('have.length', 4)
    frame
      .get('[data-test-id="multi-statement-list-content"]', { timeout: 10000 })
      .should('have.length', 1)
    frame
      .get('[data-test-id="multi-statement-list-content"]', { timeout: 10000 })
      .first()
      .should('contain', 'ERROR')
  })
})
