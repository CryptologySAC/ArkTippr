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
  const arktoshis = 1
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

describe('sender._amountLargerThanMinimum', () => {
  const sender = 'marcs1970'
  const receiver = 'arktippr'
  let arktoshis = 20000000
  let send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send._amountLargerThanMinimum).toBeFunction()
  })

  it('should return true if the amount is larger than or equal to the minimum', () => {
    let returnValue = send._amountLargerThanMinimum()
    expect(returnValue).toBeTrue()

    arktoshis = 990000000
    send = new Send(sender, receiver, arktoshis, mainnet)
    returnValue = send._amountLargerThanMinimum()
    expect(returnValue).toBeTrue()
  })

  it('should return false if the amount is smaller than the minimum', () => {
    arktoshis = 1
    send = new Send(sender, receiver, arktoshis, mainnet)
    const returnValue = send._amountLargerThanMinimum()
    expect(returnValue).toBeFalse()
  })
})

describe('sender._testSendToSelf', () => {
  const sender = 'marcs1970'
  let receiver = 'arktippr'
  const arktoshis = 20000000
  let send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send._testSendToSelf).toBeFunction()
  })

  it('should return false if sender.username !== receiver.username', () => {
    let returnValue = send._testSendToSelf()
    expect(returnValue).toBeFalse()
  })

  it('should throw an error if sender.username === receiver.username', () => {
    send = new Send(sender, sender, arktoshis, mainnet)
    let error
    try {
      send._testSendToSelf()
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(Error)
  })
})

describe('sender._sendTransaction', () => {
  const sender = 'arktippr'
  let receiver = 'marcs1970'
  const arktoshis = 20000000
  let send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send._sendTransaction).toBeFunction()
  })

  it('should return a transactionId for a valid transaction', async () => {
    const transactionId = await send._sendTransaction()
    expect(transactionId).toBeString()
  })
})

describe('sender._sendReply', () => {
  const sender = 'arktippr'
  let receiver = 'marcs1970'
  const arktoshis = 20000000
  let send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send._sendReply).toBeFunction()
  })
})

describe('sender.sendTransaction', () => {
  const sender = 'arktippr'
  let receiver = 'marcs1970'
  const arktoshis = 20000000
  let send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send.sendTransaction).toBeFunction()
  })
})
