'use strict'

const Command = require('../../lib/utils/command.js')

describe('command', () => {
  it('should be an instance of the Command class', () => {
    const command = new Command()
    expect(command).toBeInstanceOf(Command)
  })

  it('should set internal values with the constructor', () => {
    const sender = 'senderUsername'
    const receiver = 'receiverUsername'
    const mainnet = 'mainnetObject'
    const submissionID = 'IDString'
    const parentID = 'IDString'

    const command = new Command(sender, receiver, mainnet, submissionID, parentID)

    expect(command.sender).toBe(sender)
    expect(command.receiver).toBe(receiver)
    expect(command.mainnet).toBe(mainnet)
    expect(command.submissionID).toBe(submissionID)
    expect(command.parentID).toBe(parentID)
  })
})

describe('command.__getARKTicker', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command.__getARKTicker).toBeFunction()
  })

  it('should guard the US$ exchange rate >0 in the command Object', async () => {
    const currency = 'EUR'
    try {
      await command.__getARKTicker(currency)
    } catch (err) {
      console.error(err)
    }
    expect(command.usdExchangeRate).toBeNumber()
    expect(command.usdExchangeRate).toBeGreaterThan(0)
  })

  it('should return 0 if a non-supported currency is probed', async () => {
    const currency = 'WRONG'
    const exchangeRate = await command.__getARKTicker(currency)
    expect(exchangeRate).toBe(0)
  })

  it('should return a number > 0 if a supported currency is probed', async () => {
    const currency = 'EUR'
    let exchangeRate
    try {
      exchangeRate = await command.__getARKTicker(currency)
    } catch (err) {
      console.error(err)
    }
    expect(exchangeRate).toBeNumber()
    expect(exchangeRate).toBeGreaterThan(0)
  })

  it('should return a 1.0 if a ARK currency is probed', async () => {
    const currency = 'ARK'
    let exchangeRate
    try {
      exchangeRate = await command.__getARKTicker(currency)
    } catch (err) {
      console.error(err)
    }
    expect(exchangeRate).toBe(1.0)
  })
})

describe('command.__formatNumberFloat', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command.__formatNumberFloat).toBeFunction()
  })

  it('should return a (float) 1.0 for input (string) 1.0', () => {
    const output = 1.0
    const input = '1.0'

    expect(command.__formatNumberFloat(input)).toBeNumber()
    expect(command.__formatNumberFloat(input)).toBe(output)
  })

  it('should return a (float) 1.0 for input (string) 1,0', () => {
    const output = 1.0
    const input = '1,0'

    expect(command.__formatNumberFloat(input)).toBeNumber()
    expect(command.__formatNumberFloat(input)).toBe(output)
  })

  it('should throw for badly formatted input', () => {
    const commaAndDot = '1,000.00'
    const doubleDot = '1.000.000'
    const doubleComma = '1,000,000'
    const text = 'not a number at all'

    let error
    try {
      command.__formatNumberFloat(commaAndDot)
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(Error)

    error = null
    try {
      command.__formatNumberFloat(doubleDot)
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(Error)

    error = null
    try {
      command.__formatNumberFloat(doubleComma)
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(Error)

    error = null
    try {
      command.__formatNumberFloat(text)
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(Error)
  })
})

describe('command._arkToshiToUSD', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command._arkToshiToUSD).toBeFunction()
  })

  it('should return 0 if no exchange rate was probed', () => {
    const ark = 1
    expect(command._arkToshiToUSD(ark)).toBe(0)
  })

  it('should return a number > 0 if exchange rate was probed', async () => {
    const currency = 'ARK'
    await command.__getARKTicker(currency)
    const ark = 1500000000
    const usd = command._arkToshiToUSD(ark)
    expect(usd).toBeNumber()
    expect(usd).toBeGreaterThan(0)
  })
})
