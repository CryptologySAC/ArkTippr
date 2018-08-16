'use strict'

const User = require('./user')
const logger = require('../../services/logger')
const database = require('../../services/database')
const redditConfig = require('../../services/reddit.js')
const messages = require('../../config/messages')
const Joi = require('joi')
const validateWhatsApp = Joi.extend(require('joi-phone-number'))

require('dotenv').config()
const ARKTIPPER = process.env.ADDRESS_ARKTIPPR
const REDDITBOT = process.env.REDDIT_USER

class redditUser extends User {
  constructor (username) {
    if (typeof (username) !== 'undefined') {
      username = username.replace('u/', '')
    }

    super(username)
    this.platform = 'whatsapp'
  }

  async isValidUser () {
    logger.error(`USERNAME: ${this.username}`)
    return await validateWhatsApp.string().phoneNumber({format: 'e164'}).validate(this.username)
    .then(()=> {
      logger.error(`USERNAME: ${this.username} OK`)
      return true
    })
    .catch( () => {
      logger.error(`USERNAME: ${this.username} WRONG`)
      return false
    })
  }

  async _createUser (username) {
    try {
      const wallet = this._createNewWallet()

      if (typeof (wallet) === 'undefined' || !wallet.hasOwnProperty('seed')) {
        throw new Error(`Could not create wallet: ${JSON.stringify(wallet)}`)
      }

      const encryptedSeed = this._generateSecretFromSeed(wallet.seed)

      if (this._getSeedFromSecret(encryptedSeed) !== wallet.seed) {
        throw new Error(`Error creating encrypted seed for: ${username}`)
      }

      const sql = 'INSERT INTO whatsapp(username, address, seed) VALUES($1, $2, $3) RETURNING *'
      const values = [username, wallet.address, encryptedSeed]

      const res = await database.query(sql, values)
      if (typeof (res.rows[0]) === 'undefined') {
        throw new Error(`Could not create user ${username}`)
      }
      return res.rows[0]
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async getAddress (username) {
    if (!username) {
      username = this.username
    }

    // Return the correct address for the ArkTippr bot (Address outside of Reddit, can't send WITHDRAW message to myself)
    if (username.toLowerCase() === REDDITBOT) {
      return ARKTIPPER
    }

    try {
      const result = await database.query('SELECT * FROM whatsapp WHERE username = $1 LIMIT 1', [username])
      let user = result.rows[0]

      if (typeof (user) === 'undefined') {
        logger.warn(`User with username '${username}' does not yet exist in the database. Creating new user.`)
        user = await this._createUser(username)
        logger.info(`User with username '${username}' created.`)
      }

      if (typeof (user) === 'undefined' || !user.hasOwnProperty('address')) {
        throw new Error(`Problem retrieving the address from ${JSON.stringify(user)}`)
      }

      return user.address
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async getSeed (username) {
    if (!username) {
      username = this.username
    }

    try {
      const result = await database.query('SELECT * FROM whatsapp WHERE username = $1 LIMIT 1', [username])
      let user = result.rows[0]

      if (typeof (user) === 'undefined') {
        logger.warn(`User with username '${username}' does not yet exist in the database. Creating new user.`)
        user = await this._createUser(username)
        logger.info(`User with username '${username}' created.`)
      }

      if (!user.hasOwnProperty('seed')) {
        throw new Error(`Could not retrieve seed from user ${JSON.stingify(user)}`)
      }

      const seedDecrypted = this._getSeedFromSecret(user.seed)
      return seedDecrypted
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async sendTipNotification (submissionID, transactionId, amount, usd) {
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
        reply = messages.tipNotification(this.username, amount, usd, transactionId) + messages.footer()
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
      await this.sendMessage(message, subject)
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
      await this.sendMessage(message, subject)
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
      await this.sendMessage(message, subject)
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
      await this.sendMessage(message, subject)
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
      await this.sendMessage(message, subject)
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
      await this.sendMessage(message, subject)
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
      await this.sendMessage(message, subject)
      logger.info(`u/${this.username} has been notified by message of CREATED STICKERCODE: ${stickerCode}.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendBalanceReply (balance, usdValue) {
    const subject = 'Your ArkTippr wallet balance'
    let message
    if (balance === null) {
      message = messages.noBalanceMessage()
    } else {
      message = messages.balanceMessage(balance, usdValue)
    }
    message = message + messages.footer()
    try {
      await this.sendMessage(message, subject)
      logger.info(`u/${this.username} has been notified by message of BALANCE.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendDepositReply (address) {
    const subject = 'Your ArkTippr wallet address'
    const message = messages.depositMessage(address) + messages.footer()

    try {
      await this.sendMessage(message, subject)
      logger.info(`u/${this.username} has been notified by message of ADDRESS / DEPOSIT.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendWithdrawHelpReply () {
    const subject = 'ArkTippr Help - Withdraw'
    const message = messages.helpWithdrawMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
      logger.info(`u/${this.username} has been notified by message of WITHDRAW HELP.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendSendHelpReply () {
    const subject = 'ArkTippr Help - Send'
    const message = messages.helpSendMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
      logger.info(`u/${this.username} has been notified by message of SEND HELP.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendDonateHelpReply () {
    const subject = 'ArkTippr Help - Donate'
    const message = messages.helpDonateMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
      logger.info(`u/${this.username} has been notified by message of DONATE HELP.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendStickersHelpReply () {
    const subject = 'ArkTippr Help - Stickers'
    const message = messages.helpStickersMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
      logger.info(`u/${this.username} has been notified by message of STICKERS HELP.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendTipHelpReply () {
    const subject = 'ArkTippr Help - Tipping'
    const message = messages.helpTipMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
      logger.info(`u/${this.username} has been notified by message of TIP HELP.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async sendMessage (message, subject) {
    return redditConfig.composeMessage({
      to: this.username,
      subject,
      text: message
    })
    .then(() => {
      return true
    })
    .catch(error => {
      logger.error(error)
      return false
    })
  }

  async sendWithdrawReply (transactionId, amount, usd) {
    amount = this._formatBalance(amount)

    const subject = 'ArkTippr Withdrawal Success'
    const message = messages.transactionWithdrawMessage(amount, usd, transactionId) + messages.footer()

    try {
      await this.sendMessage(message, subject)
      logger.info(`u/${this.username} has been notified by message of WITHDRAW TRANSACTION: ${transactionId}.`)
    } catch (error) {
      logger.error(error)
      return false
    }
  }
}
module.exports = redditUser
