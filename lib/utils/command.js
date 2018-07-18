'use strict'

const axios = require('axios')
const User = require('./user')
const logger = require('../services/logger')
const _COMMANDS = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'TIP', 'UNVOTE', 'VOTE', 'HELP', 'ADDRESS', 'DONATE']
const _CURRENCIES = ['ARK', 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR', 'BTC', 'ETH', 'XRP', 'LTC', 'BCH']
const ArkToshis = 100000000

require('dotenv').config()

class Command {
  constructor (sender, receiver, mainnet, submissionID, parentID) {
    this.sender = sender
    this.receiver = receiver
    this.mainnet = mainnet
    this.submissionID = submissionID
    this.parentID = parentID
  }

 /**
  * @dev  Distinguish if we should parse a mention or a command
  * @param {string} body The text that we need to parse
  **/
  async parseBody (body) {
    body = body.toUpperCase().trim().split(/\s+/)

    // Check if we parse a Private Message or a Mention
    try {
      if (this.receiver !== null) {
        // Mention
        let arkToshiValue = await this._parseMention(body)

        if (arkToshiValue !== null) {
          arkToshiValue = parseInt(arkToshiValue, 10)
          await this._sendTip(arkToshiValue)
        }
        return
      }

      // Command
     // await this._parseCommand(body)
    } catch (error) {
      logger.error(error.message)
    }
  }

  async _parseCommand (body) {
    // Private Message
      let commands = []

      // In future usage we might opt to allow multiple commands per PM.
      // Currently we will only execute 1 command per PM, to prevent confusion.
      _COMMANDS.forEach(item => {
console.log(item) // TODO REMOVE
        if (body[0].includes(item)) { commands.push(item) }
      })

      // Process Commands
      if (commands.length === 0) {
        // commands.push('HELP')
      }
      console.log(commands)
      commands.forEach(async command => {
        await this._checkCommand(command, body)
      })
  }

 /**
  * @dev  Parse an array to see if it contains a valid tip
  * @param {array} bodyParts The strings to parse
  * @returns Value of the tip in ArkToshi or null
  **/
  async _parseMention (bodyParts) {
    try {
      const username = `u/${process.env.REDDIT_USER}`.toUpperCase()
      const mentionIndex = parseInt(bodyParts.indexOf(username), 10)

      logger.info('Mention of Tipbot received.')

      const amount = bodyParts[mentionIndex - 2]
      const currency = bodyParts[mentionIndex - 1]

      if (typeof (amount) === 'undefined' && typeof (currency) === 'undefined') {
        throw new Error('This mention is a reply to a comment the Tipbot made.')
      }

      const arkToshiValue = await this._amountToArktoshi(amount, currency)

      if (arkToshiValue === null) {
        throw new Error('This mention does not contain a valid tip.')
      }

      logger.info(`Tip mention received: ${amount} ${currency} = ${arkToshiValue} ArkToshis.`)

      return arkToshiValue
    } catch (error) {
      logger.warn(error.message)
      return null
    }
  }

 /**
  * @dev  Parse a currency/amount combination to get currency and amount
  * @param {string} amount Combination of amount and currency 10USD, USD1.1, USD 1, 10 USD
  * returns object {currency, amount} or false
  **/
  __parseAmountCurrency (amount) {
    amount = amount.toUpperCase()
    const currencies = _CURRENCIES

    for (let i in currencies) {
      if (amount.startsWith(currencies[i]) || amount.endsWith(currencies[i])) {
        let currency = currencies[i]
        let value = amount.replace(currency, '').trim()

        return {currency, amount: value}
      }
    }

    try {
      const onlyAmount = this.__formatNumberFloat(amount)

      // User added only an amount without currency, so it's ARK
      if (typeof (onlyAmount) === 'number') {
        return {currency: 'ARK', amount: onlyAmount}
      }
    } catch (error) {
      // No need to handle this error now
    }

    return false
  }

 /**
  * @dev  Parse the tip command and return the tip value in ArkToshi
  * @param {string} amount The intended tip amount
  * @param {string} currency The intended tip currency
  **/
  async _amountToArktoshi (amount, currency) {
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

      amount = this.__formatNumberFloat(amount)

      const value = await this._getExchangedValue(amount, currency)

      // check for overflow on the ARKToshis and inputted amount
      amount = parseInt(amount, 10)
      if (!Number.isSafeInteger(value) || !Number.isSafeInteger(amount)) {
        throw new RangeError('Amount is too large, causing an overflow.')
      }
      return value
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async _getExchangedValue (amount, currency) {
    const exchangeRate = await this.__getARKTicker(currency)
    return parseInt(amount * ArkToshis / exchangeRate, 10)
  }

  __formatNumberFloat (number) {
    number = number.toString().replace(/[,]/g, '.')

    const dots = number.toString().split('.').length - 1
    number = parseFloat(number)

    if (number > 0 && dots <= 1) {
      // All good
      return number
    }

    // Always wrong
    throw new RangeError('Amount formatted incorrectly.')
  }

  async __getARKTicker (currency) {
    // Check if the user is trying to tip with an unsupported currency
    currency = currency.toUpperCase().trim()
    if (_CURRENCIES.indexOf(currency) < 0) {
      this.usdExchangeRate = 0
      return 0
    }

    try {
      // Retrieve exchange rate from CoinMarketCap
      currency = currency.toLowerCase()
      const url = 'https://api.coinmarketcap.com/v1/ticker/ark/'
      const params = {
        convert: currency
      }
      const response = await axios.get(url, {params})

      // Process the received response
      if (response.data[0].hasOwnProperty(`price_${currency}`)) {
        const exchangeRate = parseFloat(response.data[0][`price_${currency}`])
        this.usdExchangeRate = parseFloat(response.data[0]['price_usd'])

        logger.info(`Exchange rate for ${currency.toUpperCase()} received: ${exchangeRate}`)
        return exchangeRate
      }
      throw new URIError(`Could not retrieve exchange rate for ${currency.toUpperCase()}`)
    } catch (error) {
      logger.error(error.message)
      return 0
    }
  }

  async _sendTip (ark) {
    const sender = new User(this.sender)
    const receiver = new User(this.receiver)

    const txID = await sender.sendTip(ark, this.receiver, this.mainnet)
    const usd = this._arkToshiToUSD(ark)
    await receiver.sendTipNotification(this.submissionID, txID, ark, usd, this.mainnet)
  }

  _arkToshiToUSD (ark) {
    let usd = this.usdExchangeRate ? this.usdExchangeRate : 0
    ark = parseInt(ark, 10)

    if (ark === 0 || usd === 0 || ArkToshis === 0) {
      return 0
    }

    ark = (ark * usd) / ArkToshis
    return parseFloat(ark).toFixed(2)
  }

  async _checkCommand (command, body) {
    switch (command) {
      case 'BALANCE':
        return this._getBalance()
        // break
      case 'DEPOSIT':
      case 'ADDRESS':

        break
      case 'WITHDRAW':

        break
      case 'TIP':
      case 'DONATE':

        break
      case 'UNVOTE':

        break
      case 'VOTE':
        this._getDelegate(body[body.indexOf(command) + 1])
        break
      case 'HELP':

        break
      default:
    }
  }

  async _getBalance () {
    try {
      const user = new User(this.sender)
      const balance = await user.getBalance(this.mainnet)

      return await user.sendBalanceReply(balance, this.submissionID)
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async _unvote (delegate) {

  }

  async _vote (delegate) {

  }

  _getDelegate (username) {
    console.log(`delegate: ${username}`)
  }
}

module.exports = Command
