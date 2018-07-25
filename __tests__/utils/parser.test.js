'use strict'

const Parser = require('../../lib/utils/parser.js')
const parser = new Parser()
const _CURRENCIES = ['ARK', 'Ѧ', 'USD', '$', 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', '€', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR', 'BTC', 'ETH', 'XRP', 'LTC', 'BCH']

describe('parser', () => {
  it('should be an object', () => {
    expect(parser).toBeObject()
  })
})

describe('parser.parseAmount', () => {
  it('should be a function', () => {
    expect(parser.parseAmount).toBeFunction()
  })

  it('should return null for invalid input', async () => {
    let badAmount
    let badCurrency
    let goodAmount = '1'
    let goodCurrency = 'ARK'

    // undefined amount and currency e.g. ( _, _ )
    let result = await parser.parseAmount(badAmount, badCurrency)
    expect(result).toBeNil()

    // undefined currency and bad amount e.g. ( BAD, _ )
    badAmount = 'notAnAmount'
    result = await parser.parseAmount(badAmount, badCurrency)
    expect(result).toBeNil()

    // undefined amount and bad currency e.g. ( _, BAD )
    result = await parser.parseAmount(badCurrency, badAmount)
    expect(result).toBeNil()

    // undefinced amount and good currency e.g. ( _, ARK )
    result = await parser.parseAmount(badCurrency, goodCurrency)
    expect(result).toBeNil()

    // bad amount and bad currency e.g. ( BAD, BAD )
    badCurrency = 'NOTGOOD'
    result = await parser.parseAmount(badAmount, badCurrency)
    expect(result).toBeNil()

    // good amount and bad currency e.g. ( 1, BAD )
    result = await parser.parseAmount(goodAmount, badCurrency)
    expect(result).toBeNil()

    // bad amount and good currency e.g. ( BAD, ARK )
    result = await parser.parseAmount(badAmount, goodCurrency)
    expect(result).toBeNil()
  })

  it('should return a 0 for correct input with 0', async () => {
    const amount = '0'
    const currency = 'ARK'
    const result = await parser.parseAmount(amount, currency)
    expect(result).toBe(0)
  })

  it('should return 100000000 for correct input with 1', async () => {
    const amount = '1'
    let currency
    let result = await parser.parseAmount(amount, currency)
    expect(result).toBe(100000000)

    currency = 'ARK'
    result = await parser.parseAmount(amount, currency)
    expect(result).toBe(100000000)
  })

  let undefinedVar
  const amount = '1'
  for (let item in _CURRENCIES) {
    let currency = _CURRENCIES[item]

    it(`should return a number > 0 for correct input with ${currency}`, async () => {
      let result = await parser.parseAmount(amount, currency)
      expect(result).toBeNumber()
      expect(result).toBeGreaterThan(0)

      result = await parser.parseAmount(currency, amount)
      expect(result).toBeNumber()
      expect(result).toBeGreaterThan(0)

      result = await parser.parseAmount(currency + amount, undefinedVar)
      expect(result).toBeNumber()
      expect(result).toBeGreaterThan(0)

      result = await parser.parseAmount(amount + currency, undefinedVar)
      expect(result).toBeNumber()
      expect(result).toBeGreaterThan(0)
    })
  }
})

describe('parser.parseMention', () => {
  it('should be a function', () => {
    expect(parser.parseMention).toBeFunction()
  })

  it('should return null for invalid input', async () => {
    let badBody

    // undefined body
    let result = await parser.parseMention(badBody)
    expect(result).toBeNil()

    // Only a mention
    badBody = 'u/arktippr'
    result = await parser.parseMention(badBody)
    expect(result).toBeNil()

    // Not a valid command
    badBody = 'anything that is not valid for u/arktippr We just mentioned him'
    result = await parser.parseMention(badBody)
    expect(result).toBeNil()

    badBody = '10 for u/arktippr'
    result = await parser.parseMention(badBody)
    expect(result).toBeNil()

    badBody = '10 nocurrency u/arktippr'
    result = await parser.parseMention(badBody)
    expect(result).toBeNil()

    badBody = '10nocurrency u/arktippr'
    result = await parser.parseMention(badBody)
    expect(result).toBeNil()
  })

  it('should return an Object for a valid mention', async () => {
    let body = 'stickers u/arktippr'
    let command = 'STICKERS'
    let result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKey('command')
    expect(result.command).toBe(command)

    body = 'stickers u/arktippr.'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKey('command')
    expect(result.command).toBe(command)

    body = 'I am giving you stickers u/arktippr so you can enjoy them'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKey('command')
    expect(result.command).toBe(command)

    command = 'TIP'
    body = '10 USD u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBeGreaterThanOrEqual(0)

    body = '10USD u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBeGreaterThanOrEqual(0)

    body = 'USD 10 u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBeGreaterThanOrEqual(0)

    body = 'USD10 u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBeGreaterThanOrEqual(0)

    body = '$ 10 u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBeGreaterThanOrEqual(0)

    body = '$10 u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBeGreaterThanOrEqual(0)

    body = '10 $ u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBeGreaterThanOrEqual(0)

    body = '10$ u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBeGreaterThanOrEqual(0)

    body = '10 u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBe(1000000000)

    body = 'something 10 u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBe(1000000000)

    body = 'ARK10 u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBe(1000000000)

    body = '10ARK u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBe(1000000000)

    body = '10 ARK u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBe(1000000000)

    body = 'Ѧ10 u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBe(1000000000)

    body = 'Ѧ 10 u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBe(1000000000)

    body = '10Ѧ u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBe(1000000000)

    body = '10 Ѧ u/arktippr'
    result = await parser.parseMention(body)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'arkToshiValue'])
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).not.toBeNil()
    expect(result.arkToshiValue).toBe(1000000000)
  })
})

describe('parser.parseCommand', () => {
  it('should be a function', () => {
    expect(parser.parseCommand).toBeFunction()
  })

  it('should return null for invalid input', async () => {
    let badBody

    // undefined body
    let result = await parser.parseCommand(badBody)
    expect(result).toBeNil()

    // Only a mention
    badBody = 'u/arktippr'
    result = await parser.parseCommand(badBody)
    expect(result).toBeNil()

    // Not a valid command
    badBody = 'anything that is not valid for u/arktippr We just messaged him'
    result = await parser.parseCommand(badBody)
    expect(result).toBeNil()
  })

  it('should return an Array of commands for a valid input', async () => {
    let body = 'stickers'
    let command = 'STICKERS'
    let result = await parser.parseCommand(body)
    expect(result).toBeArray()
    expect(result[0]).toContainKey('command')
    expect(result[0].command).toBe(command)

    body = 'stickers arktippr'
    let username = 'arktippr'
    result = await parser.parseCommand(body)
    expect(result).toBeArray()
    expect(result[0]).toContainKeys(['command', 'username'])
    expect(result[0].command).toBe(command)
    expect(result[0].username).toBe(username)

    body = 'stickers u/arktippr'
    result = await parser.parseCommand(body)
    expect(result).toBeArray()
    expect(result[0]).toContainKeys(['command', 'username'])
    expect(result[0].command).toBe(command)
    expect(result[0].username).toBe(username)

    command = 'SEND'
    body = 'send u/arktippr 10 USD'
    result = await parser.parseCommand(body)
    expect(result).toBeArray()
    expect(result[0]).toContainKeys(['command', 'username', 'arkToshiValue'])
    expect(result[0].command).toBe(command)
    expect(result[0].username).toBe(username)
    expect(result[0].arkToshiValue).not.toBeNil()

    body = 'send u/arktippr 11 USD send u/arktippr 20USD ARK'
    result = await parser.parseCommand(body)
    expect(result).toBeArray()
    expect(result[0]).toContainKeys(['command', 'username', 'arkToshiValue'])
    expect(result[0].command).toBe(command)
    expect(result[0].username).toBe(username)
    expect(result[0].arkToshiValue).not.toBeNil()
    expect(result[1]).toContainKeys(['command', 'username', 'arkToshiValue'])
    expect(result[1].command).toBe(command)
    expect(result[1].username).toBe(username)
    expect(result[1].arkToshiValue).not.toBeNil()
  })
})

describe('parser._commandIndex', () => {
  it('should be a function', () => {
    expect(parser._commandIndex).toBeFunction()
  })

  it('should return a number', () => {
    const needle = 'findThis'
    let bodyParts = ['0', '1', needle, '3', '4']
    let result = parser._commandIndex(needle, bodyParts)
    expect(result).toBeNumber()
    expect(result).toBe(2)

    bodyParts = ['0', '1', 'findThis.itIsHere', '3', '4']
    result = parser._commandIndex(needle, bodyParts)
    expect(result).toBeNumber()
    expect(result).toBe(2)
  })

  it('should return -1 if not found', () => {
    const needle = 'findThis'
    let bodyParts = ['0', '1', '2', '3', '4']
    let result = parser._commandIndex(needle, bodyParts)
    expect(result).toBeNumber()
    expect(result).toBe(-1)
  })
})

describe('parser.validateInput', () => {
  it('should be a function', () => {
    expect(parser.validateInput).toBeFunction()
  })

  it('should return true on correct input', () => {
    let amount = 2000000
    let address = 'Aa74QyqAFBsevReox3rMWy6FhMUyJVGPop'
    let result = parser.validateInput(amount, address)
    expect(result).toBeTrue()
  })

  it('should return false on bad input', () => {
    let amount = 2000000
    let address = 'Not an address'
    let result = parser.validateInput(amount, address)
    expect(result).toBeFalse()
  })
})

describe('parser._checkCommand', () => {
  it('should be a function', () => {
    expect(parser._checkCommand).toBeFunction()
  })

  it('should return a "help" command object when message requesting help received', async () => {
    const _COMMANDS = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'SEND', 'VOTE', 'HELP', 'ADDRESS', 'DONATE', 'STICKERS', 'TIP']
    for (let item in _COMMANDS) {
      let command = _COMMANDS[item]
      const bodyParts = [command, 'nothingNoUsername...', 'interesting', 'here']
      let result = await parser._checkCommand(command, bodyParts)
      expect(result).toBeObject()
      expect(result).toContainKey('command')
      expect(result).not.toContainKey('username')
      expect(result).not.toContainKey('address')
      expect(result).not.toContainKey('arkToshiValue')
      expect(result.command).toBe(command)
    }
  })

  it('should return a valid command for SEND', async () => {
    const command = 'SEND'
    const bodyParts = [command, 'arktippr', '10', 'ARK']
    let result = await parser._checkCommand(command, bodyParts)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'username', 'arkToshiValue'])
    expect(result).not.toContainKey('address')
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).toBeNumber()
  })

  it('should return a valid command for DONATE', async () => {
    const command = 'DONATE'
    const bodyParts = [command, '10', 'ARK']
    let result = await parser._checkCommand(command, bodyParts)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'username', 'arkToshiValue'])
    expect(result).not.toContainKey('address')
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).toBeNumber()
  })

  it('should return a valid command for WITHDRAW', async () => {
    const command = 'WITHDRAW'
    const bodyParts = [command, 'Aa74QyqAFBsevReox3rMWy6FhMUyJVGPop', '10', 'ARK']
    let result = await parser._checkCommand(command, bodyParts)
    expect(result).toBeObject()
    expect(result).toContainKeys(['address', 'command', 'arkToshiValue'])
    expect(result).not.toContainKey('username')
    expect(result.command).toBe(command)
    expect(result.arkToshiValue).toBeNumber()
  })

  it('should return a valid command for STICKERS', async () => {
    const command = 'STICKERS'
    const bodyParts = [command, 'arktippr']
    let result = await parser._checkCommand(command, bodyParts)
    expect(result).toBeObject()
    expect(result).toContainKeys(['command', 'username'])
    expect(result).not.toContainKey('address')
    expect(result).not.toContainKey('arkToshiValue')
    expect(result.command).toBe(command)
  })
})

describe('parser._parseArguments', () => {
  it('should be a function', () => {
    expect(parser._parseArguments).toBeFunction()
  })
})
