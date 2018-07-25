'use strict'

const logger = require('../services/logger')
const database = require('../services/database')
const crypto = require('crypto')
const arkjs = require('arkjs')
const networks = require('../config/networks')
const Snoowrap = require('snoowrap')
const messages = require('../config/messages')

require('dotenv').config()
const redditConfig = new Snoowrap({
    userAgent: 'ArkTippr',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
})

const ENCRYPTION_KEY = process.env.CRYPTO_PASS // Must be 256 bytes (32 characters)
const IV_LENGTH = 16 // For AES, this is always 16
const ALGORITHM = 'aes-256-cbc'
const ARKTIPPER = process.env.ADDRESS_ARKTIPPR
const REDDITBOT = process.env.REDDIT_USER
const ArkToshis = 100000000
const ARK = 'Ѧ'

class User {
  constructor (username) {
    try {
      this.username = username
    } catch (error) {
      logger.error(error.message)
    }
  }

  async isValidUser () {
    try {
      const redditUser = await redditConfig.getUser(this.username).getTrophies()

      return redditUser && redditUser.hasOwnProperty('trophies')
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

 /**
  * @dev Retrieve the balance for an address and set and return the lowest of confirmed/unconfirmed balances
  * @param {objet} mainnet The Ark mainnet object
  * @returns balance (integer)
  **/
  async getBalance (mainnet) {
    try {
      // Check if user has address in DB
      this.arkAddress = await this.getAddress(this.username)
      const balance = await mainnet.getBalance(this.arkAddress)

      const confirmedBalance = parseInt(balance.confirmedBalance, 10)
      const unConfirmedBalance = parseInt(balance.unConfirmedBalance, 10)

      logger.error(` BALANCES: ${JSON.stringify(balance)} C ${confirmedBalance} U ${unConfirmedBalance}`)
      this.balance = confirmedBalance <= unConfirmedBalance ? confirmedBalance : unConfirmedBalance
      return this.balance
    } catch (error) {
      console.warn(error.message)
      return null
    }
  }

  async _createUser (username) {
    try {
      const wallet = this._createNewWallet()
      const encryptedSeed = this._generateSecretFromSeed(wallet.seed)
      const sql = 'INSERT INTO users(username, address, seed) VALUES($1, $2, $3) RETURNING *'
      const values = [username, wallet.address, encryptedSeed]

      const res = await database.query(sql, values)
      return res.rows[0]
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  _createNewWallet () {
    arkjs.crypto.setNetworkVersion(networks.mainnet.version)

    // Create the wallet
    const passphrase = require('bip39').generateMnemonic()
    const wif = arkjs.crypto.getKeys(passphrase).toWIF()
    const address = arkjs.crypto.getAddress(arkjs.crypto.getKeys(passphrase).publicKey)

    const result = {
      seed: passphrase,
      wif,
      address
    }

    return result
  }

  async getAddress (username) {
    if (!username) {
      username = this.username
    }

    // Return the correct address for the ArkTippr bot (outside of Reddit)
    if (username.toLowerCase() === REDDITBOT) {
      return ARKTIPPER
    }

    try {
      const result = await database.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username])
      let user = result.rows[0]

      if (typeof (user) === 'undefined') {
        logger.warn(`User with username '${username}' does not yet exist in the database. Creating new user.`)
        user = await this._createUser(username)
        logger.info(`User with username '${username}' created.`)
      }

      return user.address
    } catch (error) {
      logger.error(`Error executing query: ${error.stack}`)
      return null
    }
  }

  async getSeed (username) {
    if (!username) {
      username = this.username
    }

    try {
      const result = await database.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username])
      let user = result.rows[0]

      if (typeof (user) === 'undefined') {
        logger.warn(`User with username '${username}' does not yet exist in the database. Creating new user.`)
        user = await this._createUser(username)
        logger.info(`User with username '${username}' created.`)
      }

      const seedDecrypted = this._getSeedFromSecret(user.seed)
      return seedDecrypted
    } catch (error) {
      logger.error(`Error executing query: ${error.stack}`)
      return null
    }
  }

  _getSeedFromSecret (key) {
    const textParts = key.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString()
  }

  _generateSecretFromSeed (seed) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(process.env.CRYPTO_PASS), iv)
    let encrypted = cipher.update(seed)

    encrypted = Buffer.concat([encrypted, cipher.final()])

    return iv.toString('hex') + ':' + encrypted.toString('hex')
  }

  /**
  * @dev  Format inputted balance to a string
  * @param {integer} amount The amount in Arktoshi
  * @returns  String with amount
  **/
  _formatBalance (amount) {
    amount = parseInt(amount, 10)

    if (!Number.isSafeInteger(amount)) {
      amount = 0
    }

    const balance = parseFloat(amount / ArkToshis).toFixed(8)
    return `${ARK}${balance}`
  }

  async sendTipNotification (submissionID, transactionId, amount, usd) {
    amount = this._formatBalance(amount)

    const reply = messages.tipNotification(this.username, amount, usd, transactionId) + messages.footer()
    try {
      let submission = await redditConfig.getComment(submissionID)
      submission.reply(reply)
      submission.upvote()
      logger.info(`u/${this.username} has been notified in the comments.`)
      return true
    } catch (error) {
      logger.error(error.message)
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
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendMinimalAmountReply () {
    const subject = 'ArkTippr transaction failed - Amount to low'
    const message = messages.minimumValueMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendTransactionReply (receiver, transactionId, amount, usd) {
    logger.info(`Send message to ${this.username} with ${transactionId}`)

    amount = this._formatBalance(amount)

    const subject = 'You directly sent Ark via ArkTippr!'
    const message = messages.transactionMessage(receiver, amount, usd, transactionId) + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendTransactionReceiveReply (username, transactionId, amount, usd) {
    amount = this._formatBalance(amount)

    const address = await this.getAddress()
    const subject = 'You\'ve got Ark!'
    const message = messages.transactionReceiveMessage(username, amount, usd, address, transactionId) + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendStickerSendReply (transactionId, amount, usd, receiver) {
    logger.info(`Send message to ${this.username} with ${transactionId}`)

    amount = this._formatBalance(amount)

    const subject = 'ArkStickers transaction success!'
    const message = messages.transactionStickersMessage(receiver, amount, usd, transactionId) + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendStickersReply (submissionID, transactionId) {
    console.log(`Send Stickers reply to ${submissionID} with ${transactionId}`)

    const reply = messages.stickersNotification(this.username, transactionId) + messages.footer()
    try {
      let submission = await redditConfig.getComment(submissionID)
      submission.reply(reply)
      submission.upvote()
      logger.info(`u/${this.username} has been notified in the comments.`)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendStickerCode (sender, stickerCode) {
    logger.info(`Send message to ${this.username} with sticker code: ${stickerCode}`)

    const subject = 'You have free Ark stickers waiting!'
    const message = messages.stickersCodeMessage(sender, stickerCode) + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendNewStickerCode (transactionId, stickerCode) {
    logger.info(`Send message to ${this.username} with sticker code: ${stickerCode}`)

    const subject = `ArkTippr generated sticker code ${stickerCode}`
    const message = messages.newStickersCodeMessage(transactionId, stickerCode)

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
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
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendDepositReply (address) {
    const subject = 'Your ArkTippr wallet address'
    const message = messages.depositMessage(address) + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendWithdrawHelpReply () {
    const subject = 'ArkTippr Help - Withdraw'
    const message = messages.helpWithdrawMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendSendHelpReply () {
    const subject = 'ArkTippr Help - Send'
    const message = messages.helpSendMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendDonateHelpReply () {
    const subject = 'ArkTippr Help - Donate'
    const message = messages.helpDonateMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendStickersHelpReply () {
    const subject = 'ArkTippr Help - Stickers'
    const message = messages.helpStickersMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendTipHelpReply () {
    const subject = 'ArkTippr Help - Tipping'
    const message = messages.helpTipMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendVoteReply () {
    const subject = 'ArkTippr Help - Voting'
    const message = messages.voteMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendHelpReply () {
    const subject = 'ArkTippr Help'
    const message = messages.helpMessage() + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
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
      logger.info(`Ark Tipbot message ${subject} to ${this.username} sent.`)
      return true
    })
    .catch(error => {
      logger.error(error)
      return false
    })
  }

  async sendDonationReply (transactionId, amount, usd) {
    logger.info(`Send message to ${this.username} with ${transactionId}`)

    amount = this._formatBalance(amount)

    const subject = 'Thanks for your donation to ArkTippr!'
    const message = messages.transactionDonationMessage(amount, usd, transactionId) + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async sendWithdrawReply (transactionId, amount, usd) {
    logger.info(`Send message to ${this.username} with ${transactionId}`)

    amount = this._formatBalance(amount)

    const subject = 'ArkTippr Withdrawal Success'
    const message = messages.transactionWithdrawMessage(amount, usd, transactionId) + messages.footer()

    try {
      await this.sendMessage(message, subject)
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }
}
module.exports = User
