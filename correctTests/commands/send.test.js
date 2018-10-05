'use strict'

const Send = require('../../lib/commands/send.js')
const mainnet = require('../__support__/mainnet.js')

const sender = 'marcs1970'
const receiver = 'arktippr'
const arktoshis = 100000000
const platform = 'reddit'
const receiverPlatform = 'reddit'

const send = new Send(sender, receiver, arktoshis, mainnet, platform, receiverPlatform)

describe('send', () => {
  it('should be an Object', () => {
    expect(send).toBeObject(Send)
  })

  it('should correctly initialize', () => {
    expect(send.sender.username).toBe(sender)
    expect(send.receiver.username).toBe(receiver)
    expect(send.arktoshis).toBe(arktoshis)
    expect(send.platform).toBe(platform)
    expect(send.receiverPlatform).toBe(receiverPlatform)
  })
})

describe('sender.sendTransaction', () => {
  it('should be a function', () => {
    expect(send.sendTransaction).toBeFunction()
  })

  it('should return true for a correct transaction', async () => {
    const result = await send.sendTransaction()
    expect(result).toBeTrue()
  })

  const sendBelowMinimum = new Send(sender, receiver, 1, mainnet, platform, receiverPlatform)
  it('should return false for a transaction below minimum amount', async () => {
    const result = await sendBelowMinimum.sendTransaction()
    expect(result).toBeFalse()
  })

  const sendToSelf = new Send(sender, sender, arktoshis, mainnet, platform, receiverPlatform)
  it('should return false for a transaction where user and receiver are the same', async () => {
    const result = await sendToSelf.sendTransaction()
    expect().toBeFalse(result)
  })
})

/*

describe('send.__senderHasBalance', () => {
  const sender = 'marcs1970'
  const receiver = 'arktippr'
  const arktoshis = 1
  const send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send.__senderHasBalance).toBeFunction()
  })

  it('should return true if sender has sufficient balance for this transaction', async () => {
    let returnValue = await send.__senderHasBalance()
    expect(returnValue).toBeTrue()
  })

  it('should throw an Error if sender has insufficient balance for this transaction', async () => {
    mainnet.setBadsender(true)

    let error
    try {
      await send.__senderHasBalance()
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(Error)
  })
})

describe('sender.__amountLargerThanMinimum', () => {
  const sender = 'marcs1970'
  const receiver = 'arktippr'
  let arktoshis = 20000000
  let send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send.__amountLargerThanMinimum).toBeFunction()
  })

  it('should return true if the amount is larger than or equal to the minimum', () => {
    let returnValue = send.__amountLargerThanMinimum()
    expect(returnValue).toBeTrue()

    arktoshis = 990000000
    send = new Send(sender, receiver, arktoshis, mainnet)
    returnValue = send.__amountLargerThanMinimum()
    expect(returnValue).toBeTrue()
  })

  it('should return false if the amount is smaller than the minimum', () => {
    arktoshis = 1
    send = new Send(sender, receiver, arktoshis, mainnet)
    const returnValue = send.__amountLargerThanMinimum()
    expect(returnValue).toBeFalse()
  })
})

describe('sender.__testSendToSelf', () => {
  const sender = 'marcs1970'
  let receiver = 'arktippr'
  const arktoshis = 20000000
  let send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send.__testSendToSelf).toBeFunction()
  })

  it('should return false if sender.username !== receiver.username', () => {
    let returnValue = send.__testSendToSelf()
    expect(returnValue).toBeFalse()
  })

  it('should throw an error if sender.username === receiver.username', () => {
    send = new Send(sender, sender, arktoshis, mainnet)
    let error
    try {
      send.__testSendToSelf()
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(Error)
  })
})

describe('sender.__sendTransaction', () => {
  const sender = 'arktippr'
  let receiver = 'marcs1970'
  const arktoshis = 20000000
  let send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send.__sendTransaction).toBeFunction()
  })

  it('should return a transactionId for a valid transaction', async () => {
    const transactionId = await send.__sendTransaction()
    expect(transactionId).toBeString()
  })
})

describe('sender.__sendReply', () => {
  const sender = 'arktippr'
  let receiver = 'marcs1970'
  const arktoshis = 20000000
  let send = new Send(sender, receiver, arktoshis, mainnet)

  it('should be a function', () => {
    expect(send.__sendReply).toBeFunction()
  })
})
*/
