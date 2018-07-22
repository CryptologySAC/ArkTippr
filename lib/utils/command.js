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
      const mentionIndex = this._commandIndex(username, bodyParts)

      logger.info('Mention of Tipbot received.')

      const amount = bodyParts[mentionIndex - 2]
      const currency = bodyParts[mentionIndex - 1]

      const arkToshiValue = await this._parseAmount(amount, currency)

      logger.info(`Tip mention received: ${amount} ${currency} = ${arkToshiValue} ArkToshis.`)

      return arkToshiValue
    } catch (error) {
      logger.warn(error.message)
      return null
    }
  }

 // TODO unit test

  // TODO unit test
  async _checkCommand (command, bodyParts) {
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
        return
      case 'SEND':
        await this.send(bodyParts)
        return
      case 'DONATE':
        await this.donate(bodyParts)
        return

      case 'WITHDRAW':
        await this.withdraw(bodyParts)
        break

      case 'STICKERS':
        await this.stickers(bodyParts)
    }
  }

  // TODO unit tests

  async withdraw (bodyParts) {
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

  async send (bodyParts) {
    try {
      // Parse to see if help or transaction
      // SEND <username> <amount> [currency]
      const command = 'SEND'
      const sendIndex = this._commandIndex(command, bodyParts)

      const username = bodyParts[sendIndex + 1].toLowerCase()
      const amount = bodyParts[sendIndex + 2]
      const currency = bodyParts[sendIndex + 3]
      const arkToshiValue = await this._parseSend(username, amount, currency)

      if (arkToshiValue === null) {
        // Request for help
        const user = new User(this.sender)
        await user.sendSendHelpReply()
        return
      }

      const transaction = new Send(this.sender, username, arkToshiValue, this.mainnet)
      await transaction.sendTransaction(this.submissionID)
      return true
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async donate (bodyParts) {
    try {
      const username = process.env.REDDIT_USER
      const command = 'DONATE'
      const sendIndex = this._commandIndex(command, bodyParts)

      const amount = bodyParts[sendIndex + 1]
      const currency = bodyParts[sendIndex + 2]
      const arkToshiValue = await this._parseSend(username, amount, currency)

      if (arkToshiValue === null) {
        // Request for help
        const user = new User(this.sender)
        await user.sendDonateHelpReply()
        return
      }

      const transaction = new Donate(this.sender, username, arkToshiValue, this.mainnet)
      await transaction.sendDonation(this.submissionID)
      return true
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async _parseSend (username, amount, currency) {
    try {
      const receiver = new User(username)
      const validUser = await receiver.isValidUser()
      if (!validUser) {
        return null
      }
      const arkToshiValue = await this._parseAmount(currency, amount) // not amount, currency as this is not a mention, but inverted input
      return arkToshiValue
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  _commandIndex (needle, bodyParts) {
    const index = parseInt(bodyParts.indexOf(needle), 10)

    return index
  }

  async _parseAmount (amount, currency) {
    if (typeof (amount) === 'undefined' && typeof (currency) === 'undefined') {
        throw new Error('No valid amount parsed: Command for HELP or regular mention.')
    }

    const arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)

    if (arkToshiValue === null) {
      throw new Error('No valid amount parsed.')
    }

    return arkToshiValue
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
