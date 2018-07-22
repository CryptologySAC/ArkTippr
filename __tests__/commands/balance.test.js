'use strict'

const Balance = require('../../lib/commands/balance.js')
const mainnet = require('../__support__/mainnet.js')

describe('balance', () => {
  it('should be an instance of the Balance class', () => {
    const balance = new Balance()
    expect(balance).toBeInstanceOf(Balance)
  })
})

describe('balance.sendBalance', () => {
  const username = 'marcs1970'
  const balance = new Balance(username, mainnet)

  it('should be a function', () => {
    expect(balance.sendBalance).toBeFunction()
  })
})
