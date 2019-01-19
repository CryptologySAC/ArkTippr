'use strict'
require('dotenv').config()

const crypto = require('crypto')
const arkecosystem = require('@arkecosystem/crypto')
const arkCrypto = arkecosystem.crypto
const logger = require('../services/logger')
const database = require('../services/database')

const Transaction = require('../utils/transactions')
const transactionBuilder = new Transaction()
const network = require('../services/network')

const ARKTIPPER = process.env.ADDRESS_ARKTIPPR
const NETVERSION = process.env.NETVERSION ? `${process.env.NETVERSION}` : '23'

const ARKTIPPR_SEED = process.env.ARKTIPPR_SEED ? process.env.ARKTIPPR_SEED : ''
const FILL_AMOUNT = process.env.FILL_AMOUNT ? parseInt(process.env.FILL_AMOUNT, 10) : 20000
const FILL_VENDORFIELD = process.env.FILL_VENDORFIELD ? process.env.FILL_VENDORFIELD : ''

const ENCRYPTION_KEY = process.env.CRYPTO_PASS // Must be 256 bytes (32 characters)
const IV_LENGTH = 16 // For AES, this is always 16
const ALGORITHM = 'aes-256-cbc'

class User {
  constructor (username, platform = null) {
    this.username = username
    this.platform = platform
  }

  /**
  * @dev  Check if the current user is valid on this platform.
  **/
  async isValidUser () {
    logger.warn('No generic isValidUser available, use platform version.')
    return false
  }

  /**
  * @dev  Get the seed for this user.
  **/
  async getSeed (username, platform = null) {
    if (!username) {
      username = this.username
    }

    if (!platform) {
      platform = this.platform
    }

    try {
      const result = await database.query('SELECT * FROM users WHERE username = $1 AND platform = $2 LIMIT 1', [username, platform])
      let user = result.rows[0]

      if (typeof user === 'undefined') {
        // logger.warn(`User with username '${username}' does not yet exist in the database. Trying Lowercase version.`)

        const result = await database.query('SELECT * FROM users WHERE username = $1 AND platform = $2 LIMIT 1', [username.toLowerCase(), platform])
        user = result.rows[0]

        if (typeof user === 'undefined') {
          logger.warn(`User with username '${username.toLowerCase()}' does not exist either in the database.`)
          user = await this._createUser(username)
          logger.info(`User with username '${username.toLowerCase()}' created.`)
        }
      }

      if (!user.hasOwnProperty('seed')) {
        throw new Error(`Could not retrieve seed from user ${JSON.stingify(user)}`)
      }

      const seedDecrypted = this.__getSeedFromSecret(user.seed)
      return seedDecrypted
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  /**
  * @dev Retrieve the balance for an address and set and return the lowest of confirmed/unconfirmed balances
  * @param {objet} mainnet The Ark mainnet object
  * @returns balance (integer)
  **/
  async getBalance (mainnet) {
    try {
      const address = await this.getAddress()
      if (typeof address === 'undefined' || address === null) {
        throw new Error(`No address found for ${this.username}`)
      }
      const balance = await mainnet.getBalance(address)

      if (typeof balance === 'undefined' || balance === null) {
        throw new Error(`Did not receive a valid balance for ${address}`)
      }
      this.balance = parseInt(balance, 10)
      logger.info(`BALANCE of ${this.username} received: ${this.balance}.`)
      return this.balance
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async getAddress (username = null, platform = null) {
    if (!username) {
      username = this.username
    }

    if (!platform) {
      platform = this.platform
    }

    // Return the correct address for the ArkTippr bot (Address outside of platforms, can't send WITHDRAW message to myself)
    if (this.__isArkTipprUser(username)) {
      return ARKTIPPER
    }

    try {
      let result = await database.query('SELECT * FROM users WHERE username = $1 AND platform = $2 LIMIT 1', [username, platform])
      let user = result.rows[0]

      if (typeof user === 'undefined') {
        // logger.warn(`User with username '${username}' does not yet exist in the database. Trying Lowercase version.`)

        const result = await database.query('SELECT * FROM users WHERE username = $1 AND platform = $2 LIMIT 1', [username.toLowerCase(), platform])
        user = result.rows[0]

        if (typeof user === 'undefined') {
          logger.warn(`User with username '${username.toLowerCase()}' does not exist either in the database.`)
          user = await this.__createUser(username, platform)
          logger.info(`User with username '${username.toLowerCase()}' created.`)
        }
      }

      if (typeof user === 'undefined' || !user.hasOwnProperty('address')) {
        throw new Error(`Problem retrieving the address from ${JSON.stringify(user)}`)
      }

      return user.address
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  /* Communicate with the users */
  async sendWithdrawReply () {
    logger.warn('No generic sendWithdrawReply available, use platform version.')
  }

  async sendDepositReply () {
    logger.warn('No generic sendDepositReply available, use platform version.')
  }

  async sendBalanceReply () {
    logger.warn('No generic sendBalanceReply available, use platform version.')
  }

  async sendHelpReply () {
    logger.warn('No generic sendHelpReply available, use platform version.')
  }

  /* Private Methods */
  __getSeedFromSecret (key) {
    const textParts = key.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encryptedText)

    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
  }

   __generateSecretFromSeed (seed) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(process.env.CRYPTO_PASS), iv)
    let encrypted = cipher.update(seed)

    encrypted = Buffer.concat([encrypted, cipher.final()])

    return iv.toString('hex') + ':' + encrypted.toString('hex')
  }

  async __fillWallet (address) {
    const transaction = transactionBuilder.createTransaction(FILL_AMOUNT, address, FILL_VENDORFIELD, ARKTIPPR_SEED)
    await network.postTransaction([transaction])
    await network.broadcast([transaction])
  }

  __createNewWallet () {
    // Create the wallet
    const passphrase = require('bip39').generateMnemonic()
    const publicKey = arkCrypto.getKeys(passphrase).publicKey
    const address = arkCrypto.getAddress(publicKey, NETVERSION)

    const result = {
      seed: passphrase,
      address
    }

    return result
  }

  __isArkTipprUser () {
    logger.warn('No generic __isArkTipprUser available, use platform version.')
    return false
  }

  async __createUser (username, platform) {
    try {
      username = username.toLowerCase()
      const wallet = this.__createNewWallet()

      if (typeof wallet === 'undefined' || !wallet.hasOwnProperty('seed')) {
        throw new Error(`Could not create wallet: ${JSON.stringify(wallet)}`)
      }

      const encryptedSeed = this.__generateSecretFromSeed(wallet.seed)

      if (this.__getSeedFromSecret(encryptedSeed) !== wallet.seed) {
        throw new Error(`Error creating encrypted seed for: ${username}`)
      }

      const sql = 'INSERT INTO users(username, address, seed, platform) VALUES($1, $2, $3, $4) RETURNING *'
      const values = [username, wallet.address, encryptedSeed, platform]

      const res = await database.query(sql, values)
      if (typeof res.rows[0] === 'undefined') {
        throw new Error(`Could not create user ${username}`)
      }

      // Fill her up
      await this.__fillWallet(wallet.address)

      return res.rows[0]
    } catch (error) {
      logger.error(error)
      return null
    }
  }
}

module.exports = User
