'use strict'

const axios = require('axios')
const User = require('./user')
const logger = require('../services/logger')
const _COMMANDS = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'TIP', 'UNVOTE', 'VOTE', 'HELP']
const _CURRENCIES = ['ARK', 'USD', 'AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'HKD', 'IDR', 'INR', 'JPY', 'KRW', 'MXN', 'RUB']
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

  async parseBody (body) {
    body = body.toUpperCase().trim().split(/\s+/)

    /*
    for(let item in body) {
      if(body[item].includes('>')) {
        let nextItem = parseInt(item, 10) +1
        body[nextItem] = ''
      }
    }
    */

    // Check if we parse a Private Message or a Mention
    if (this.receiver === null) {
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
        commands.push('HELP')
      }
      console.log(commands)
      commands.forEach(async command => {
        await this._checkCommand(command, body)
      })
    } else {
      // Mention
      await this._checkMention(body)
    }
  }

  async _checkMention (body) {
    const username = `u/${process.env.REDDIT_USER}`.toUpperCase()
    const mentionIndex = parseInt(body.indexOf(username), 10)

    console.log(`Mention received at index ${mentionIndex}: ${body[mentionIndex - 2]} ${body[mentionIndex - 1]} ${body[mentionIndex]}`)

    const amount = body[mentionIndex - 2]
    const currency = body[mentionIndex - 1]

    const ark = await this._amountToArktoshi(amount, currency)

    await this._sendTip(ark)
  }

  async _amountToArktoshi (amount, currency) {
    try {
      amount = this.__formatNumberFloat(amount)

      console.log(`AMOUNT = ${amount}; CURRENCY: ${currency}`)

      if (_CURRENCIES.indexOf(currency) < 0) {
        // unknown currency
        throw new Error('unknown currency')
      }

      const exchangeRate = await this.__getARKTicker(currency)

      let value = parseInt(amount * ArkToshis * exchangeRate, 10)
      console.log(`EXCHANGE = ${exchangeRate}; VALUE ${value}`)

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

    ark = ark / (usd * ArkToshis)
    return parseFloat(ark)
  }

  async _checkCommand (command, body) {
    switch (command) {
      case 'BALANCE':
        return this._getBalance()
        // break
      case 'DEPOSIT':

        break
      case 'WITHDRAW':

        break
      case 'TIP':

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
