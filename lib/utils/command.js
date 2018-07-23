'use strict'

const User = require('./user')
const Parser = require('./parser')
const parser = new Parser()
const logger = require('../services/logger')
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
  * @dev  Parse and execute. Distinguish if we should parse a mention or a command
  * @param {string} body The text that we need to parse
  **/
  async execute (body, isComment) {
    // Check if we parse a Message or a Mention
    try {
      if (isComment) {
        // Command received in reply to post or comment
        const mention = await parser.parseMention(body)
        if (mention && mention.command) {
          switch (mention.command) {
            case 'TIP':
              const tip = new Tip(this.sender, this.receiver, mention.arkToshiValue, this.mainnet)
              await tip.sendTip(this.submissionID)
              break
            case 'STICKERS':
          }
        }
        return
      } else {
        // Command received in message
        const commands = await parser.parseCommand(body)
        for (let item in commands) {
          const command = commands[item]
          switch (command.command) {
            case 'BALANCE':
              const balance = new Balance(this.sender, this.mainnet)
              await balance.sendBalance()
              break
            case 'DEPOSIT':
            case 'ADDRESS':
              const deposit = new Deposit(this.sender)
              await deposit.sendDeposit()
              break
            case 'VOTE':
              const vote = new Vote(this.sender)
              await vote.sendVote()
              break
            case 'HELP':
              const help = new Help(this.sender)
              await help.sendHelp()
              break
            case 'TIP':
              await this.tip()
              break
            case 'SEND':
              await this.send(command)
              break
            case 'DONATE':
              await this.donate(command)
              break
            case 'WITHDRAW':
              // await this.withdraw(bodyParts)
              break
            case 'STICKERS':
              // await this.stickers(bodyParts)
          }
        }
      }
    } catch (error) {
      logger.error(error)
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

  async send (command) {
    try {
      const username = command.username ? command.username : null
      const arkToshiValue = command.arkToshiValue ? command.arkToshiValue : null

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

  async donate (command) {
    try {
      const username = command.username ? command.username : null
      const arkToshiValue = command.arkToshiValue ? command.arkToshiValue : null

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
