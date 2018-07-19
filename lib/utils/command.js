'use strict'

const User = require('./user')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')
const _COMMANDS = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'TIP', 'UNVOTE', 'VOTE', 'HELP', 'ADDRESS', 'DONATE']

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

  async _sendTip (ark) {
    const sender = new User(this.sender)
    const receiver = new User(this.receiver)

    const txID = await sender.sendTip(ark, this.receiver, this.mainnet)
    const usd = coinmarketcap.arkToshiToUSD(ark)
    await receiver.sendTipNotification(this.submissionID, txID, ark, usd, this.mainnet)
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
