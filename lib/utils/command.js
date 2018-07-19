'use strict'

const User = require('./user')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')
const _COMMANDS = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'TIP', 'VOTE', 'HELP', 'ADDRESS', 'DONATE']

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
      await this._parseCommand(body)
    } catch (error) {
      logger.error(error.message)
    }
  }

  /**
  * @dev  Parse an array to see if it contains a valid command and execute that command
  * @param {array} bodyParts The strings to parse
  **/
  async _parseCommand (body) {
      let commands = []

      // We allow multiple commands per PM.
      _COMMANDS.forEach(item => {
        if (body.includes(item)) { commands.push(item) }
      })

      // Process Commands
      commands.forEach(async command => {
        logger.info(`COMMAND: ${command} received`)
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

      const arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)

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

 // TODO unit test
  async _sendTip (ark) {
    if (this.sender === this.receiver) {
      logger.warn(`${this.sender} is trying to send tip to self.`)
      return
    }

    const sender = new User(this.sender)
    const receiver = new User(this.receiver)

    const txID = await sender.sendTip(ark, this.receiver, this.mainnet)
    const usd = await coinmarketcap.arkToshiToUSD(ark)
    await receiver.sendTipNotification(this.submissionID, txID, ark, usd, this.mainnet)
  }

  // TODO unit test
  async _checkCommand (command, body) {
    switch (command) {
      case 'BALANCE':
        await this.balance()
        break
      case 'DEPOSIT':
      case 'ADDRESS':
        await this.deposit()
        break
      case 'WITHDRAW':

        break
      case 'TIP':
      case 'DONATE':

        break
      case 'VOTE':

        break
      case 'HELP':

        break
    }
  }

  // TODO unit tests

  async deposit () {
    try {
      const user = new User(this.sender)
      const address = await user.getAddress()

      return await user.sendDepositReply(address)
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async balance () {
    try {
      const user = new User(this.sender)
      let balance = await user.getBalance(this.mainnet)
      let usdValue

      if (balance !== null) {
        usdValue = await coinmarketcap.arkToshiToUSD(balance.confirmedBalance)
        balance = this.mainnet.formatBalance(balance.confirmedBalance)
      }

      return await user.sendBalanceReply(balance, usdValue)
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async _vote (delegate) {

  }
}

module.exports = Command
