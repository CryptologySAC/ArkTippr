'use strict'

const Send = require('../../lib/commands/send.js')
const mainnet = require('../__support__/mainnet.js')

describe('send', () => {
  it('should be an instance of the Send class', () => {
    const send = new Send()
    expect(send).toBeInstanceOf(Send)
  })
})

describe('send._senderHasBalance', () => {
  const sender = 'marcs1970'
  const receiver = 'arktippr'
  const arktoshis = 100000000 // 1 Ark
  const send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send._senderHasBalance).toBeFunction()
  })

  it('should return true if sender has sufficient balance for this transaction', async () => {
    let returnValue = await send._senderHasBalance()
    expect(returnValue).toBeTrue()
  })

  it('should throw an Error if sender has insufficient balance for this transaction', async () => {
    mainnet.setBadsender(true)

    let error
    try {
      await send._senderHasBalance()
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(Error)
  })
})
