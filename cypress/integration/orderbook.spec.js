/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { TestIds } from '../../types/common'

describe('Navigation', () => {
  it('should navigate to order book page', () => {
    // Start from the index page
    cy.visit('http://localhost:3000/')
    cy.getByFirstTestId(TestIds.orderBookHeaderTitle).contains('Order Book')
  })
})
