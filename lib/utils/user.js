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

class User {
  constructor (username) {
    try {
      this.username = username
    } catch (error) {
      logger.error(error.message)
    }
  }

  async getBalance (mainnet) {
    try {
      // Check if user has address in DB
      const arkAddress = await this.getAddress(this.username)
      const balance = await mainnet.getBalance(arkAddress)

      return balance
    } catch (error) {
      console.warn(error.message)
      return null
    }
  }

  async sendBalanceReply (balance, usdValue) {
    const subject = 'BALANCE'
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
    const subject = 'DEPOSIT'
    const message = messages.depositMessage(address) + messages.footer()

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
      subject: `Ark Tipbot | ${subject}`,
      text: message
    })
    .then(() => {
      logger.info(`Ark Tipbot message to ${this.username} sent.`)
      return true
    })
    .catch(error => {
      logger.error(error)
      return false
    })
  }

  async sendTip (ark, receiver, mainnet) {
    const senderSeed = await this._getSeed(this.username)
    const receiverAddress = await this.getAddress(receiver)
    console.log(`receiver ${receiver} at ${receiverAddress}; sender ${this.username} with ${senderSeed}`)

    // do transaction
    const txID = 'transaction'
    return txID
  }

  async sendTipNotification (submissionID, txID, amount, usd, mainnet) {
    console.log(`Send reply to ${submissionID} with ${txID}`)

    amount = mainnet.formatBalance(amount)

    const reply = messages.tipNotification(this.username, amount, usd) + messages.footer()
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

    try {
      const result = await database.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username])
      let user = result.rows[0]

      if (typeof (user) === 'undefined') {
        logger.warn(`User with username '${username}' does not yet exist in the database. Creating new user.`)
        user = await this._createUser(username)
        logger.info(`User with username '${username}' created.`)
      }

      // const seedDecrypted = this._getSeedFromSecret(user.seed)
      return user.address
    } catch (error) {
      logger.error(`Error executing query: ${error.stack}`)
      return null
    }
  }

  async _getSeed (username) {
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
}
module.exports = User
