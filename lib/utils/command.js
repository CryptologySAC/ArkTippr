'use strict'

const User = require('./user')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')
const _COMMANDS = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'SEND', 'VOTE', 'HELP', 'ADDRESS', 'DONATE', 'STICKERS', 'TIP']
const Balance = require('../commands/balance')
const Deposit = require('../commands/deposit')
const Donate = require('../commands/donate')
const Send = require('../commands/send')
const Stickers = require('../commands/stickers')
const Tip = require('../commands/tip')
const Vote = require('../commands/vote')
const Withdraw = require('../commands/withdraw')
const Help = require('../commands/help')

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
          const tip = new Tip(this.sender, this.receiver, arkToshiValue, this.mainnet)
          await tip.sendTip(this.submissionID)
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
      body.forEach(item => {
        if (_COMMANDS.includes(item)) { commands.push(item) }
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

  // TODO unit test
  async _checkCommand (command, body) {
    switch (command) {
      case 'BALANCE':
        const balance = new Balance(this.sender, this.mainnet)
        await balance.sendBalance()
        return
      case 'DEPOSIT':
      case 'ADDRESS':
        const deposit = new Deposit(this.sender)
        await deposit.sendDeposit()
        return
      case 'VOTE':
        const vote = new Vote(this.sender)
        await vote.sendVote()
        return
      case 'HELP':
        const help = new Help(this.sender)
        await help.sendHelp()
        return
      case 'TIP':
        await this.tip()
        break

      case 'WITHDRAW':
        await this.withdraw(body)
        break
      case 'SEND':
        await this.send(body)
        break
      case 'DONATE':
        await this.donate(body)
        break

      case 'STICKERS':
        await this.stickers(body)
    }
  }

  // TODO unit tests

  async withdraw (body) {
    try {
      const user = new User(this.sender)
      // const address = await user.getAddress()
// TODO A LOT
      return await user.sendWithdrawHelpReply()
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async send (body) {
    try {
      const user = new User(this.sender)
      // const address = await user.getAddress()
// TODO A LOT
      return await user.sendSendHelpReply()
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async donate (body) {
    try {
      const user = new User(this.sender)
      // const address = await user.getAddress()
// TODO A LOT
      return await user.sendDonateHelpReply()
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async stickers (body) {
    try {
      const user = new User(this.sender)
      // const address = await user.getAddress()
// TODO A LOT
      return await user.sendStickersHelpReply()
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async tip () {
    try {
      const user = new User(this.sender)

      return await user.sendTipHelpReply()
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }
}

module.exports = Command
