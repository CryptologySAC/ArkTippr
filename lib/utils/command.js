'use strict'

const User = require('./user/user')
const Parser = require('./parser')
const parser = new Parser()
const logger = require('../services/logger')
const redditConfig = require('../services/reddit.js')
const Balance = require('../commands/balance')
const Deposit = require('../commands/deposit')
const Send = require('../commands/send')
const Stickers = require('../commands/stickers')
const Tip = require('../commands/tip')
const TipHelp = require('../commands/tipHelp')
const Withdraw = require('../commands/withdraw')
const Help = require('../commands/help')
const messages = require('../config/messages')

class Command {
  constructor (sender, receiver, platform, mainnet, submissionID, parentID) {
    this.sender = sender
    this.receiver = receiver
    this.mainnet = mainnet
    this.submissionID = submissionID
    this.parentID = parentID
    this.platform = platform
  }

  /**
  * @dev  Parse and execute. Distinguish if we should parse a mention or a command
  * @param {string} body The text that we need to parse
  **/
  async execute (body, isComment) {
    try {
      if (isComment) {
        // Command received in reply to post or comment
        const mention = await parser.parseMention(body)
        if (mention && mention.command) {
          switch (mention.command) {
            case 'TIP':
              if (!mention.arkToshiValue) {
                throw new Error('No amount in arktoshi calculated.')
              }
              const tip = new Tip(this.sender, this.receiver, mention.arkToshiValue, this.mainnet, this.submissionID)
              await tip.sendTransaction()
              break
            case 'STICKERS':
              mention.username = this.receiver
              const stickersTransaction = await this.stickers(mention)
              await stickersTransaction.sendMentionReply(this.submissionID)
              break
          }
        } else {
          // ArkTippr didn't understand the mention
          const comment = await redditConfig.getComment(this.submissionID)
          const reply = messages.summonedReply()
          await comment.reply(reply)
        }
        return
      } else {
        // Command received in message
        const commands = await parser.parseCommand(body)
        for (let item in commands) {
          const command = commands[item]
          switch (command.command) {
            case 'BALANCE':
              const balance = new Balance(this.sender, this.mainnet, this.platform)
              await balance.sendBalance()
              break
            case 'DEPOSIT':
            case 'ADDRESS':
              const deposit = new Deposit(this.sender, this.platform)
              await deposit.sendDeposit()
              break
            case 'HELP':
              const help = new Help(this.sender, this.platform)
              await help.sendHelp()
              break
            case 'TIP':
              const tipHelp = new TipHelp(this.sender, this.platform)
              await tipHelp.sendHelp()
              break
            case 'SEND':
              await this.send(command)
              break
            case 'WITHDRAW':
              await this.withdraw(command)
              break
            case 'STICKERS':
              await this.stickers(command)
          }
        }
      }
    } catch (error) {
      logger.error(error)
    }
  }

  async withdraw (command) {
    try {
      const address = command.address ? command.address : null
      let arkToshiValue = command.arkToshiValue ? command.arkToshiValue : null

      if (address === null) {
        // Request for help
        const user = new User(this.sender)
        await user.sendWithdrawHelpReply()
        return
      }

      if (arkToshiValue === null) {
        // send max amount
        const user = new User(this.sender)
        const balance = await user.getBalance(this.mainnet)
        const fee = await this.mainnet.getFee()

        arkToshiValue = parseInt(balance, 10) - parseInt(fee, 10)
      }

      const transaction = new Withdraw(this.sender, address, arkToshiValue, this.mainnet)
      await transaction.sendTransaction(this.submissionID)
      return true
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async send (command) {
    try {
      const username = command.username ? command.username : null
      const arkToshiValue = command.arkToshiValue ? command.arkToshiValue : null

      if (arkToshiValue === null || username === null) {
        // Request for help
        const user = new User(this.sender)
        await user.sendSendHelpReply()
        return
      }

      const transaction = new Send(this.sender, username, arkToshiValue, this.mainnet)
      await transaction.sendTransaction(this.submissionID)
      return true
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async stickers (command) {
    try {
      const username = command.username ? command.username : null

      if (username === null) {
        // Request for help
        const user = new User(this.sender)
        await user.sendStickersHelpReply()
        return
      }

      const transaction = new Stickers(this.sender, username, this.mainnet)
      await transaction.sendTransaction(this.submissionID)

      return transaction
    } catch (error) {
      logger.error(error)
      return null
    }
  }
}

module.exports = Command
