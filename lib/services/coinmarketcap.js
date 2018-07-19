'use strict'
const logger = require('./logger')
const axios = require('axios')
const _CURRENCIES = ['ARK', 'USD', 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR', 'BTC', 'ETH', 'XRP', 'LTC', 'BCH']
const ArkToshis = 100000000

class CoinMarketCap {
 /**
  * @dev  Get the Arktoshi value of an amount in currency
  * @param {float} amount The amount to calculate
  * @param {string} currency The currency to calculate the exchangerate for
  * @returns  Integer with value in Arktoshi
  **/
  async getExchangedValue (amount, currency) {
    try {
      currency = currency.toUpperCase().trim()

      if (_CURRENCIES.indexOf(currency) < 0) {
        throw new Error(`${currency} is not supported.`)
      }

      let amountCheck = parseFloat(amount)
      if (amountCheck.toString() !== amount.toString()) {
        throw new Error(`${amount} is not a valid amount.`)
      }

      const exchangeRate = await this._getARKTicker(currency)
      const value = parseInt(amount * ArkToshis / exchangeRate, 10)

      if (this.checkOverflow(value) || this.checkOverflow(amount)) {
        throw new RangeError(`${amount} ${currency} is too large and causes an overflow error`)
      }

      return value
    } catch (error) {
      logger.error('Coinmarketcap.getExchangedValue: ' + error.message)
      return null
    }
  }

 /**
  * @dev  Test if a number overflows
  * @param {anything} number The number to test
  * @returns True if overflows or false
  **/
  checkOverflow (number) {
    number = parseInt(number, 10)
    if (Number.isSafeInteger(number)) {
      return false
    }
    return true
  }

 /**
  * @dev  Returns the USD value of the inputted ArkToshis
  * @param {integer} arkToshis Amount in Arktoshis
  * @returns A string with the USD value in 2 digits 0.00
  **/
  async arkToshiToUSD (arkToshis) {
    let usd
    if (!this.usdExchangerate) {
      usd = await this._getARKTicker('USD')
    } else {
      usd = this.usdExchangeRate
    }

    arkToshis = parseInt(arkToshis, 10)

    if (arkToshis === 0 || usd === 0 || ArkToshis === 0) {
      return parseFloat(0).toFixed(2)
    }

    arkToshis = (arkToshis * usd) / ArkToshis
    return parseFloat(arkToshis).toFixed(2)
  }

  /**
  * @dev  Parse the tip command and return the tip value in ArkToshi
  * @param {string} amount The intended tip amount
  * @param {string} currency The intended tip currency
  **/
  async amountToArktoshi (amount, currency) {
    if (typeof (amount) === 'undefined') {
      amount = ''
    }

    try {
      // Remove the commas
      amount = amount.toString().replace(/[,]/g, '.')
      currency = currency.toString().replace(/[,]/g, '.')

      // User has inputted <amount> <currency>
      if (_CURRENCIES.indexOf(currency) >= 0 && parseFloat(amount).toString() === amount) {
        amount = parseFloat(amount)

      // User has inputted <currency> <amount>
      } else if (_CURRENCIES.indexOf(amount) >= 0 && parseFloat(currency).toString() === currency) {
        [amount, currency] = [currency, amount]

      // User has inputted an amount only
      } else if (_CURRENCIES.indexOf(amount) < 0 && parseFloat(currency).toString() === currency) {
        amount = currency
        currency = 'ARK'

      // User has inputted <currency><amount> or <amount><currency>
      } else if (!(_CURRENCIES.indexOf(currency) >= 0 && parseFloat(amount).toString() === amount)) {
        let amountCurrency = this.__parseAmountCurrency(currency)

        amount = amountCurrency.amount
        currency = amountCurrency.currency
      } else {
        throw new Error('unknown currency')
      }

      amount = parseFloat(amount)

      const value = await this.getExchangedValue(amount, currency)

      // check for overflow on the ARKToshis and inputted amount
      amount = parseInt(amount, 10)
      if (this.checkOverflow(value) || this.checkOverflow(amount)) {
        throw new RangeError('Amount is too large, causing an overflow.')
      }
      return value
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async _getARKTicker (currency) {
    // Check if the user is trying to tip with an unsupported currency
    currency = currency.toUpperCase().trim()
    if (_CURRENCIES.indexOf(currency) < 0) {
      this.usdExchangeRate = 0
      return 0
    }

    try {
      // Retrieve exchange rate from CoinMarketCap
      currency = currency.toUpperCase()
      // const url = 'https://api.coinmarketcap.com/v1/ticker/ark/'
      const url = 'https://api.coinmarketcap.com/v2/ticker/1586/'
      const params = {
        convert: currency
      }
      const response = await axios.get(url, {params})

      // Process the received response
      if (response.data.data.hasOwnProperty('name') && response.data.data.name.toLowerCase() === 'ark') {
        const exchangeRate = parseFloat(response.data.data.quotes[currency].price)
        this.usdExchangeRate = parseFloat(response.data.data.quotes.USD.price)

        logger.info(`Exchange rate for ${currency.toUpperCase()} received: ${exchangeRate}`)
        return exchangeRate
      }
      throw new URIError(`Could not retrieve exchange rate for ${currency.toUpperCase()}`)
    } catch (error) {
      logger.error(error.message)
      return 0
    }
  }

  /**
  * @dev  Parse a currency/amount combination to get currency and amount
  * @param {string} amount Combination of amount and currency 10USD, USD1.1, USD 1, 10 USD
  * returns object {currency, amount} or false
  **/
  __parseAmountCurrency (amount) {
    amount = amount.toString().replace(/[,]/g, '.').toUpperCase()
    const currencies = _CURRENCIES

    for (let i in currencies) {
      if (amount.startsWith(currencies[i]) || amount.endsWith(currencies[i])) {
        let currency = currencies[i]
        let value = amount.replace(currency, '').trim()

        return {currency, amount: value}
      }
    }

    try {
      const onlyAmount = parseFloat(amount)

      // User added only an amount without currency, so it's ARK
      if (onlyAmount.toString() === amount) {
        return {currency: 'ARK', amount: onlyAmount}
      }
    } catch (error) {
      // No need to handle this error now
    }

    return false
  }
}

module.exports = new CoinMarketCap()
