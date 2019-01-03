'use strict'
require('dotenv').config()
const User = require('../user')

const logger = require('../../services/logger')
const redditConfig = require('./reddit.js')
const messages = require('../messages')

const Messenger = require('./messenger')
const messenger = new Messenger()

const REDDITBOT = process.env.REDDIT_USER
const __REDDIT = 'reddit'

class RedditUser extends User {
  constructor (username = null) {
    if (username !== null) {
      username = username.replace('u/', '')
    }

    super(username, __REDDIT)
  }

  /**
  * @dev  Check if the current user is valid on this platform.
  **/
  async isValidUser () {
    try {
      const redditUser = await redditConfig.getUser(this.username).getTrophies()
      return redditUser && redditUser.hasOwnProperty('trophies')
    } catch (error) {
      return false
    }
  }

  async sendTipNotification (submissionID, transactionId, amount, usd, smallFooter = false) {
    try {
      if (typeof (submissionID) === 'undefined') {
        throw new Error('submissionID undefined')
      }

      const submission = await redditConfig.getComment(submissionID)

      let reply

      if (typeof (transactionId) === 'undefined') {
        reply = messages.noBalanceNotification()
      } else {
        amount = this._formatBalance(amount)
        const footer = smallFooter ? messages.smallFooter() : messages.footer()
        reply = messages.tipNotification(this.username, amount, usd, transactionId) + footer
      }

      submission.reply(reply)
      logger.info(`u/${this.username} has been notified in the comments of TIP.`)
      return true
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendStickersReply (submissionID, transactionId) {
    try {
      if (typeof (submissionID) === 'undefined') {
        throw new Error('submissionID undefined')
      }

      const submission = await redditConfig.getComment(submissionID)

      let reply

      if (typeof (transactionId) === 'undefined') {
        reply = messages.noBalanceNotification()
      } else {
        reply = messages.stickersNotification(this.username, transactionId) + messages.footer()
      }

      await submission.reply(reply)
      logger.info(`u/${this.username} has been notified in the comments of STICKERS.`)
      return true
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendNotEnoughBalanceReply (arktoshis) {
    const subject = 'ArkTippr transaction failed - Insufficient balance'
    const amount = this._formatBalance(arktoshis)
    const balance = this._formatBalance(this.balance)
    const message = messages.notEnoughBalanceMessage(amount, balance, this.arkAddress) + messages.footer()
    try {
      await messenger.sendMessage(this.username, message, subject)
      logger.info(`u/${this.username} has been notified by message of INSUFFICIENT BALANCE.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendMinimalAmountReply () {
    const subject = 'ArkTippr transaction failed - Amount to low'
    const message = messages.minimumValueMessage() + messages.footer()

    try {
      await messenger.sendMessage(this.username, message, subject)
      logger.info(`u/${this.username} has been notified by message of TOO LOW AMOUNT.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendTransactionReply (receiver, transactionId, amount, usd) {
    amount = this._formatBalance(amount)

    const subject = 'You directly sent Ark via ArkTippr!'
    const message = messages.transactionMessage(receiver, amount, usd, transactionId) + messages.footer()

    try {
      await messenger.sendMessage(this.username, message, subject)
      logger.info(`u/${this.username} has been notified by message of SENT TRANSACTION: ${transactionId}.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendTransactionReceiveReply (username, transactionId, amount, usd) {
    if (typeof (transactionId) === 'undefined') {
      return false
    }

    amount = this._formatBalance(amount)

    const address = await this.getAddress()
    const subject = 'You\'ve got Ark!'
    const message = messages.transactionReceiveMessage(username, amount, usd, address, transactionId) + messages.footer()

    try {
      await messenger.sendMessage(this.username, message, subject)
      logger.info(`u/${this.username} has been notified by message of RECEIVED TRANSACTION: ${transactionId}.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendStickerSendReply (transactionId, amount, usd, receiver) {
    amount = this._formatBalance(amount)

    const subject = 'ArkStickers transaction success!'
    const message = messages.transactionStickersMessage(receiver, amount, usd, transactionId) + messages.footer()

    try {
      await messenger.sendMessage(this.username, message, subject)
      logger.info(`u/${this.username} has been notified by message of SENT TRANSACTION STICKERS: ${transactionId}.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendStickerCode (sender, stickerCode) {
    const subject = 'You have free Ark stickers waiting!'
    const message = messages.stickersCodeMessage(sender, stickerCode) + messages.footer()

    try {
      await messenger.sendMessage(this.username, message, subject)
      logger.info(`u/${this.username} has been notified by message with STICKERCODE: ${stickerCode}.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendNewStickerCode (transactionId, stickerCode) {
    const subject = `ArkTippr generated sticker code ${stickerCode}`
    const message = messages.newStickersCodeMessage(transactionId, stickerCode)

    try {
      await messenger.sendMessage(this.username, message, subject)
      logger.info(`u/${this.username} has been notified by message of CREATED STICKERCODE: ${stickerCode}.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  /**
  * @dev  Notify this user of a succesfull withdraw command
  * @param {string} transactionId The transaction ID
  * @param {integer} amount The amount in Arktoshi
  * @param {string} recipient The recipient address
  **/
  async sendWithdrawReply (transactionId, amount, recipient) {
    try {
      await messenger.sendWithdrawMessage(transactionId, amount, recipient, this.username)
      logger.info(`REDDIT: ${this.username} WITHDRAW TRANSACTION to ${recipient} - ${transactionId}.`)
    } catch (error) {
      logger.error(error)
    }
  }

  /**
  * @dev  Notify this user of his deposit address
  **/
  async sendDepositReply () {
    try {
      const address = await this.getAddress()
      await messenger.sendDepositMessage(address, this.username)
      logger.info(`REDDIT: ${this.username} DEPOSIT ADDRESS REQUESTED ${address}.`)
    } catch (error) {
      logger.error(error)
    }
  }

  /**
  * @dev  Notify this user of his balance
  **/
  async sendBalanceReply (balance) {
    try {
      await messenger.sendBalanceMessage(balance, this.username)
      logger.info(`REDDIT: ${this.username} BALANCE SENT ${balance}.`)
    } catch (error) {
      logger.error(error)
    }
  }

  /**
  * @dev  Notify this user how to use ArkTippr
  **/
  async sendHelpReply (subject) {
    try {
      await messenger.sendHelpMessage(this.username, subject)
      logger.info(`REDDIT: ${this.username} HELP SENT - SUBJECT: ${subject}.`)
    } catch (error) {
      logger.error(error)
    }
  }
  
  /* Private Methods */
  __isArkTipprUser(username) {
    return username.toLowerCase() === REDDITBOT
  }
}
module.exports = RedditUser
