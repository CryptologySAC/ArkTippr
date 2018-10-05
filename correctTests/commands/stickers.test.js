'use strict'

const Stickers = require('../../lib/commands/stickers.js')
const mainnet = require('../__support__/mainnet.js')

describe('stickers', () => {
  it('should be an instance of the stickers class', () => {
    const stickers = new Stickers()
    expect(stickers).toBeInstanceOf(Stickers)
  })
})

describe('stickers._generateCode', () => {
  const stickers = new Stickers()
  it('should be a function', () => {
    expect(stickers._generateCode).toBeFunction()
  })

  it('should return a 5 character string; all uppercase', () => {
    const result = stickers._generateCode()
    expect(result).toBeString()
    expect(result).toBe(result.toUpperCase())
    expect(result).toHaveLength(5)
  })
})

describe('stickers._testSendToSelf', () => {
  const sender = 'marcs1970'
  let receiver = 'arktippr'
  let send = new Stickers(sender, receiver, mainnet)

  it('should be a function', () => {
    expect(send._testSendToSelf).toBeFunction()
  })

  it('should return false if sender.username !== receiver.username', () => {
    let returnValue = send._testSendToSelf()
    expect(returnValue).toBeFalse()
  })

  it('should also return false if sender.username !== receiver.usernamee', () => {
    send = new Stickers(sender, sender, mainnet)
     let returnValue = send._testSendToSelf()
    expect(returnValue).toBeFalse()
  })
})

describe('stickers._sendTransaction', () => {
  const sender = 'arktippr'
  let receiver = 'marcs1970'
  let send = new Stickers(sender, receiver, mainnet)

  it('should be a function', () => {
    expect(send._sendTransaction).toBeFunction()
  })

  it('should return a transactionId for a valid transaction', async () => {
    const transactionId = await send._sendTransaction()
    expect(transactionId).toBeString()
  })
})

describe('stickers._sendReply', () => {
  const sender = 'arktippr'
  let receiver = 'marcs1970'
  let send = new Stickers(sender, receiver, mainnet)

  it('should be a function', () => {
    expect(send._sendReply).toBeFunction()
  })
})

describe('stickers.sendMentionReply', () => {
  const sender = 'arktippr'
  let receiver = 'marcs1970'
  let send = new Stickers(sender, receiver, mainnet)

  it('should be a function', () => {
    expect(send.sendMentionReply).toBeFunction()
  })

  it('should return undefined if no transactionId is defined', async () => {
    const result = await send.sendMentionReply('nothingreal')
    expect(result).not.toBeDefined()
  })
})
