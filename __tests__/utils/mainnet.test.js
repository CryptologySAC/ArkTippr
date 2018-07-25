'use strict'

const mainnet = require('../../lib/utils/mainnet.js')

describe('mainnet', () => {
  it('should be an object', () => {
    expect(mainnet).toBeObject()
  })
})

describe('mainnet.initMainNet', () => {
  it('should be a function', () => {
    expect(mainnet.initMainNet).toBeFunction()
  })

  it('should correctly initialize the connection to the Ark mainnet', async () => {
    await mainnet.initMainNet()

    expect(mainnet.symbol).toBeString()
  })
})

describe('mainnet.getBalance', () => {
  it('should be a function', () => {
    expect(mainnet.getBalance).toBeFunction()
  })

  it('should return a valid balance Object for a known address', async () => {
    const address = 'AUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv'
    const balance = await mainnet.getBalance(address)

    expect(balance).toBeObject()
    expect(balance).toContainKeys(['confirmedBalance', 'unConfirmedBalance'])
    expect(balance.confirmedBalance).toBeString()
    expect(balance.unConfirmedBalance).toBeString()
  })

  it('should return a valid 0 balance for a new or badly formatted address', async () => {
    const address = 'QUDud8tvyVZa67p3QY7XPRUTjRGnWQQ9Xv'
    const balance = await mainnet.getBalance(address)

    expect(balance).toBeObject()
    expect(balance).toContainKeys(['confirmedBalance', 'unConfirmedBalance'])
    expect(balance.confirmedBalance).toBe('0')
    expect(balance.unConfirmedBalance).toBe('0')
  })
})

describe('mainnet.getFee', () => {
  it('should be a function', () => {
    expect(mainnet.getFee).toBeFunction()
  })

  it('should return a correct network transaction fee', async () => {
    const fee = await mainnet.getFee()
    expect(fee).toBeNumber()
    expect(fee).toBeGreaterThanOrEqual(0)
  })
})

describe('mainnet.formatBalance', () => {
  it('should be a function', () => {
    expect(mainnet.formatBalance).toBeFunction()
  })

  it('should return a string for a valid input', () => {
    const amount = 110000000
    const formattedBalance = mainnet.formatBalance(amount)
    expect(formattedBalance).toBeString()
    expect(formattedBalance).toBe('Ѧ1.10000000')
  })

  it('should return a 0 string for invalid input', () => {
    const amount = 'abc'
    const formattedBalance = mainnet.formatBalance(amount)
    expect(formattedBalance).toBeString()
    expect(formattedBalance).toBe('Ѧ0.00000000')
  })
})

describe('mainnet.send', () => {
  it('should be a function', () => {
    expect(mainnet.send).toBeFunction()
  })
})
