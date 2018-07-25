'use strict'

const coinmarketcap = require('../../lib/services/coinmarketcap.js')
const ArkToshis = 100000000

describe('coinmarketcap', () => {
  it('should be an object', () => {
    expect(coinmarketcap).toBeObject()
  })
})

describe('coinmarketcap.amountToArktoshi', () => {
  it('should be a function', () => {
    expect(coinmarketcap.amountToArktoshi).toBeFunction()
  })

  it('should return ARKToshi value for input with a number and ARK currency', async () => {
    const currency = 'ARK'
    let amount = '1'
    let arkToshi = 100000000
    let arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1.1' // DOT
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1,1' // COMMA
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)
  })

  it('should return ARKToshi value for input with a number and USD currency', async () => {
    const currency = 'USD'
    let amount = '1'
    let arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1.1' // DOT
    arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1,1' // COMMA
    arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
  })

  it('should return ARKToshi value for input with ARK currency and a number', async () => {
    const currency = 'ARK'
    let amount = '1'
    let arkToshi = 100000000
    let arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1.1' // DOT
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1,1' // COMMA
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)
  })

  it('should return ARKToshi value for input with USD currency and number', async () => {
    const currency = 'USD'
    let amount = '1'
    let arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1.1' // DOT
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1,1' // COMMA
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
  })

  it('should return ARK value for input with only a number', async () => {
    const amount = 'somethingRandom'
    let currency = '1'
    let arkToshi = 100000000
    let arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)

    currency = '1.1'
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)

    currency = '1,1'
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBe(arkToshi)
  })

  it('should return ARKToshi value for input with ARK currency and a number without space', async () => {
    const currency = 'Anything'
    let amount = '1ARK'
    let arkToshi = 100000000
    let arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1.1ARK' // DOT
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1,1ARK' // COMMA
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1'
    arkToshi = 100000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1.1' // DOT
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1,1' // COMMA
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)
  })

  it('should return ARKToshi value for input with USD currency and number without space', async () => {
    const currency = 'Anything'
    let amount = '1USD'
    let arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1.1USD' // DOT
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1,1USD' // COMMA
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1'
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1.1' // DOT
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1,1' // COMMA
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
  })

  it('should return ARKToshi value for input with ARK currency and a number without space  and no previous text', async () => {
    let currency
    let amount = '1ARK'
    let arkToshi = 100000000
    let arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1.1ARK' // DOT
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = '1,1ARK' // COMMA
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1'
    arkToshi = 100000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1.1' // DOT
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)

    amount = 'ARK1,1' // COMMA
    arkToshi = 110000000
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBe(arkToshi)
  })

  it('should return ARKToshi value for input with USD currency and number without space and no previous text', async () => {
    let currency
    let amount = '1USD'
    let arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1.1USD' // DOT
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = '1,1USD' // COMMA
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1'
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1.1' // DOT
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)

    amount = 'USD1,1' // COMMA
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
  })

  it('should return a valid value for input containg currency aliases ($,€, etc)', async () => {
    let amount = '10'
    let currency = '$'
    let fullCurrency = 'USD'
    let arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    let arkToshiValueFullCurrency = await coinmarketcap.amountToArktoshi(amount, fullCurrency)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
    expect(arkToshiValue === arkToshiValueFullCurrency)

    currency = '€'
    fullCurrency = 'EUR'
    arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    arkToshiValueFullCurrency = await coinmarketcap.amountToArktoshi(amount, fullCurrency)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
    expect(arkToshiValue === arkToshiValueFullCurrency)

    arkToshiValue = await coinmarketcap.amountToArktoshi('', amount + currency)
    arkToshiValueFullCurrency = await coinmarketcap.amountToArktoshi('', amount + fullCurrency)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
    expect(arkToshiValue === arkToshiValueFullCurrency)

    arkToshiValue = await coinmarketcap.amountToArktoshi('', currency + amount)
    arkToshiValueFullCurrency = await coinmarketcap.amountToArktoshi('', fullCurrency + amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
    expect(arkToshiValue === arkToshiValueFullCurrency)
  })

  it('should return null for bad input', async () => {
    let amount = 'x'
    let currency = 'y'

    let arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBeNil()

    amount = '10'
    currency = 'unknown'
    arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    expect(arkToshiValue).toBeNil()
    arkToshiValue = await coinmarketcap.amountToArktoshi(currency, amount)
    expect(arkToshiValue).toBeNumber()
    expect(arkToshiValue).toBeGreaterThan(0)
  })
})

describe('coinmarketcap.getExchangedValue', () => {
  it('should be a function', () => {
    expect(coinmarketcap.getExchangedValue).toBeFunction()
  })

  it('should return a number > 0 for a valid amount/currency', async () => {
    let amount = 1.1
    let currency = 'USD'
    let result = await coinmarketcap.getExchangedValue(amount, currency)
    expect(result).toBeNumber()
    expect(result).toBeGreaterThan(0)

    amount = '1.5'
    result = await coinmarketcap.getExchangedValue(amount, currency)
    expect(result).toBeNumber()
    expect(result).toBeGreaterThan(0)

    currency = 'aRK'
    amount = '1'
    result = await coinmarketcap.getExchangedValue(amount, currency)
    expect(result).toBeNumber()
    expect(result).toBe(ArkToshis)
  })

  it('should return null for invalid input', async () => {
    let currency = 'Bad Currency'
    let amount = 1
    let result = await coinmarketcap.getExchangedValue(amount, currency)
    expect(result).toBeNil()

    currency = 'ARK'
    amount = 'bad amount'
    result = await coinmarketcap.getExchangedValue(amount, currency)
    expect(result).toBeNil()

    amount = Number.MAX_SAFE_INTEGER + 1
    result = await coinmarketcap.getExchangedValue(amount, currency)
    expect(result).toBeNil()

    amount = Number.MAX_SAFE_INTEGER / ArkToshis + 1
    result = await coinmarketcap.getExchangedValue(amount, currency)
    expect(result).toBeNil()
  })
})

describe('coinmarketcap.checkOverflow', () => {
  it('should be a function', () => {
    expect(coinmarketcap.checkOverflow).toBeFunction()
  })

  it('should return false for a number that does not overflow', () => {
    let number = 1
    expect(coinmarketcap.checkOverflow(number)).toBeFalse()

    number = 1.5
    expect(coinmarketcap.checkOverflow(number)).toBeFalse()

    number = '1.5'
    expect(coinmarketcap.checkOverflow(number)).toBeFalse()

    number = Number.MAX_SAFE_INTEGER
    expect(coinmarketcap.checkOverflow(number)).toBeFalse()

    number = Number.MAX_SAFE_INTEGER
    expect(coinmarketcap.checkOverflow(number)).toBeFalse()
  })

  it('should return true for a number that does overflow', () => {
    let number = Number.MAX_SAFE_INTEGER + 1
    expect(coinmarketcap.checkOverflow(number)).toBeTrue()

    number = parseFloat(Number.MAX_SAFE_INTEGER) + 1
    expect(coinmarketcap.checkOverflow(number)).toBeTrue()
  })
})

describe('coinmarketcap.arkToshiToUSD', () => {
  it('should be a function', () => {
    expect(coinmarketcap.arkToshiToUSD).toBeFunction()
  })

  it('should return a number > 0 if exchange rate was probed', async () => {
    const currency = 'ARK'
    await coinmarketcap._getARKTicker(currency)
    const ark = 1500000000
    const usd = await coinmarketcap.arkToshiToUSD(ark)
    expect(usd).toBeString()
    expect(parseFloat(usd)).toBeGreaterThan(0)
  })
})

describe('coinmarketcap._getARKTicker', () => {
  it('should be a function', () => {
    expect(coinmarketcap._getARKTicker).toBeFunction()
  })

  it('should return a valid US$ exchange rate >0', async () => {
    const currency = 'USD'
    try {
      await coinmarketcap._getARKTicker(currency)
    } catch (err) {
      console.error(err)
    }
    expect(coinmarketcap.usdExchangeRate).toBeNumber()
    expect(coinmarketcap.usdExchangeRate).toBeGreaterThan(0)
  })

  it('should return 0 if a non-supported currency is probed', async () => {
    const currency = 'WRONG'
    const exchangeRate = await coinmarketcap._getARKTicker(currency)
    expect(exchangeRate).toBe(0)
  })

  it('should return a number > 0 if a supported currency is probed', async () => {
    const currency = 'EUR'
    let exchangeRate
    try {
      exchangeRate = await coinmarketcap._getARKTicker(currency)
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
      exchangeRate = await coinmarketcap._getARKTicker(currency)
    } catch (err) {
      console.error(err)
    }
    expect(exchangeRate).toBe(1.0)
  })
})

describe('coinmarketcap.__parseAmountCurrency', () => {
  it('should be a function', () => {
    expect(coinmarketcap.__parseAmountCurrency).toBeFunction()
  })

  it('should return false for bad input', () => {
    const input = 'clearlyNotCurrency'
    expect(coinmarketcap.__parseAmountCurrency(input)).toBeFalse()
  })

  it('should return a {amount, currency} object with currency = ARK for numerical input', () => {
    const input = '1.1'
    const amount = parseFloat(input)
    const amountCurrency = coinmarketcap.__parseAmountCurrency(input)
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
    const amountCurrencyLast = coinmarketcap.__parseAmountCurrency(inputCurrencyLast)
    const amountCurrencyFirst = coinmarketcap.__parseAmountCurrency(inputCurrencyFirst)
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
