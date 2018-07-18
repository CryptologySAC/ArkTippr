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

describe('command.parseBody', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command.parseBody).toBeFunction()
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

describe('command._parseMention', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command._parseMention).toBeFunction()
  })
})

describe('command.__parseAmountCurrency', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command.__parseAmountCurrency).toBeFunction()
  })

  it('should return false for bad input', () => {
    const input = 'clearlyNotCurrency'
    expect(command.__parseAmountCurrency(input)).toBeFalse()
  })

  it('should return a {amount, currency} object with currency = ARK for numerical input', () => {
    const input = '1.1'
    const amount = parseFloat(input)
    const amountCurrency = command.__parseAmountCurrency(input)
    expect(amountCurrency).toBeObject()
    expect(amountCurrency).toContainKeys(['amount', 'currency'])
    expect(amountCurrency.currency).toBe('ARK')
    expect(amountCurrency.amount).toBeNumber()
    expect(amountCurrency.amount).toBe(amount)
  })

  it('should return a {amount, currency} object with currency for <amount><currency> or <currency><amount> input', () => {
    const inputCurrencyLast = '1.1USD'
    const inputCurrencyFirst = 'USD1.1'
    const amount = '1.1'
    const amountCurrencyLast = command.__parseAmountCurrency(inputCurrencyLast)
    const amountCurrencyFirst = command.__parseAmountCurrency(inputCurrencyFirst)
    expect(amountCurrencyLast).toBeObject()
    expect(amountCurrencyLast).toContainKeys(['amount', 'currency'])
    expect(amountCurrencyLast.currency).toBe('USD')
    expect(amountCurrencyLast.amount).toBe(amount)

    expect(amountCurrencyFirst).toBeObject()
    expect(amountCurrencyFirst).toContainKeys(['amount', 'currency'])
    expect(amountCurrencyFirst.currency).toBe('USD')
    expect(amountCurrencyFirst.amount).toBe(amount)
  })
})

describe('command._amountToArktoshi', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command._amountToArktoshi).toBeFunction()
  })

  it('should return ARKToshi value for input with a number and ARK currency', async () => {
    const currency = 'ARK'
    let amount = '1'
    let arkToshi = 100000000
    let arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1.1' // DOT
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1,1' // COMMA
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)
  })

  it('should return ARKToshi value for input with a number and USD currency', async () => {
    const currency = 'USD'
    let amount = '1'
    let arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1.1' // DOT
    arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1,1' // COMMA
    arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
  })

  it('should return ARKToshi value for input with ARK currency and a number', async () => {
    const currency = 'ARK'
    let amount = '1'
    let arkToshi = 100000000
    let arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1.1' // DOT
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1,1' // COMMA
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)
  })

  it('should return ARKToshi value for input with USD currency and number', async () => {
    const currency = 'USD'
    let amount = '1'
    let arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1.1' // DOT
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1,1' // COMMA
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
  })

  it('should return ARK value for input with only a number', async () => {
    const amount = 'somethingRandom'
    let currency = '1'
    let arkToshi = 100000000
    let arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)

    currency = '1.1'
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)

    currency = '1,1'
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)
  })

  it('should return ARKToshi value for input with ARK currency and a number without space', async () => {
    const currency = 'Anything'
    let amount = '1ARK'
    let arkToshi = 100000000
    let arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1.1ARK' // DOT
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1,1ARK' // COMMA
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1'
    arkToshi = 100000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1.1' // DOT
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1,1' // COMMA
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)
  })

  it('should return ARKToshi value for input with USD currency and number without space', async () => {
    const currency = 'Anything'
    let amount = '1USD'
    let arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1.1USD' // DOT
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1,1USD' // COMMA
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1'
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1.1' // DOT
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1,1' // COMMA
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
  })

  it('should return ARKToshi value for input with ARK currency and a number without space  and no previous text', async () => {
    let currency
    let amount = '1ARK'
    let arkToshi = 100000000
    let arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1.1ARK' // DOT
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1,1ARK' // COMMA
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1'
    arkToshi = 100000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1.1' // DOT
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1,1' // COMMA
    arkToshi = 110000000
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)
  })

  it('should return ARKToshi value for input with USD currency and number without space and no previous text', async () => {
    let currency
    let amount = '1USD'
    let arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1.1USD' // DOT
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1,1USD' // COMMA
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1'
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1.1' // DOT
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1,1' // COMMA
    arkToshiValue = await command._amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
  })

  it('should return null for bad input', async () => {
    let amount = 'x'
    let currency = 'y'

    let arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBeNil()

    amount = '10'
    currency = 'unknown'
    arkToshiValue = await command._amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBeNil()
  })
})

describe('command._getExchangedValue', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command._getExchangedValue).toBeFunction()
  })

  it('should return 100000000 for 1 ARK', async () => {
    const amount = 1
    const currency = 'ARK'
    const ArkToshi = 100000000
    const value = await command._getExchangedValue(amount, currency)
    expect(value).toBe(ArkToshi)
  })
})
