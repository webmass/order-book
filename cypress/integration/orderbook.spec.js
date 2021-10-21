/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { MainProducts, TestIds } from '../../types/common'

// TODO : more detailed tests

describe('Navigation', () => {
  it('should navigate to order book page', () => {
    cy.visit('http://localhost:3000/')
    cy.shouldTestId(TestIds.orderBookHeaderTitle, 'exist')
  })

  it('should have BTC as active default product', () => {
    cy.getByFirstTestId(TestIds.orderBookActiveProductId).should('have.value', MainProducts.btcusd)
  })

  it('should change the subscribed product id to ETH on toggle feed', () => {
    cy.getByFirstTestId(`${TestIds.orderBookProductBtn}-${MainProducts.ethusd}`).click()
    cy.shouldTestId(TestIds.orderBookLoadingMessage, 'exist')
    cy.getByFirstTestId(TestIds.orderBookActiveProductId).should('have.value', MainProducts.ethusd)
    cy.shouldTestId(TestIds.orderBookLoadingMessage, 'not.exist')
  })
})
