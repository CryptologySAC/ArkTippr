'use strict'

const Deposit = require('../../lib/commands/deposit.js')

describe('deposit', () => {
  it('should be an instance of the Deposit class', () => {
    const deposit = new Deposit()
    expect(deposit).toBeInstanceOf(Deposit)
  })
})

describe('deposit.sendDeposit', () => {
  const username = 'marcs1970'
  const deposit = new Deposit(username)

  it('should be a function', () => {
    expect(deposit.sendDeposit).toBeFunction()
  })
})
