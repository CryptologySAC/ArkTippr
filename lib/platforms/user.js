'use strict'
require('dotenv').config()

const arkecosystem = require('@arkecosystem/crypto')
const arkCrypto = arkecosystem.crypto
const logger = require('../services/logger')
const database = require('../services/database')

const Transaction = require('../utils/transactions')
const transactionBuilder = new Transaction()
const network = require('../services/network')

const ARKTIPPER = process.env.ADDRESS_ARKTIPPR
const REDDITBOT = process.env.REDDIT_USER
const NETVERSION = process.env.NETVERSION ? `${process.env.NETVERSION}` : '23'

const ARKTIPPR_SEED = process.env.ARKTIPPR_SEED ? process.env.ARKTIPPR_SEED : ''
const FILL_AMOUNT = process.env.FILL_AMOUNT ? parseInt(process.env.FILL_AMOUNT, 10) : 20000
const FILL_VENDORFIELD = process.env.FILL_VENDORFIELD ? process.env.FILL_VENDORFIELD : ''

class User {
  constructor (username) {
    this.username = username
    this.platform = null
  }

  /**
  * @dev Retrieve the balance for an address and set and return the lowest of confirmed/unconfirmed balances
  * @param {objet} mainnet The Ark mainnet object
  * @returns balance (integer)
  **/
  async getBalance (mainnet) {
    try {
      this.arkAddress = await this.getAddress(this.username)
      if (typeof this.arkAddress === 'undefined' || this.arkAddress === null) {
        throw new Error(`No address found for ${this.username}`)
      }
      const balance = await mainnet.getBalance(this.arkAddress)

      if (typeof balance === 'undefined' || balance === null) {
        throw new Error(`Did not receive a valid balance for ${this.arkAddress}`)
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

    // Return the correct address for the ArkTippr bot (Address outside of Reddit, can't send WITHDRAW message to myself)
    if (username.toLowerCase() === REDDITBOT) {
      return ARKTIPPER
    }

    try {
      let result = await database.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username])
      let user = result.rows[0]

      if (typeof user === 'undefined') {
        logger.warn(`User with username '${username}' does not yet exist in the database. Trying Lowercase version.`)

        const result = await database.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username.toLowerCase()])
        user = result.rows[0]

        if (typeof user === 'undefined') {
          logger.warn(`User with username '${username.toLowerCase()}' does not exist either in the database.`)
          user = await this._createUser(username, platform)
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

  async _createUser (username, platform) {
    try {
      username = username.toLowerCase()
      const wallet = this._createNewWallet()

      if (typeof wallet === 'undefined' || !wallet.hasOwnProperty('seed')) {
        throw new Error(`Could not create wallet: ${JSON.stringify(wallet)}`)
      }

      const encryptedSeed = this._generateSecretFromSeed(wallet.seed)

      if (this._getSeedFromSecret(encryptedSeed) !== wallet.seed) {
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

  async __fillWallet (address) {
    const transaction = transactionBuilder.createTransaction(FILL_AMOUNT, address, FILL_VENDORFIELD, ARKTIPPR_SEED)
    await network.postTransaction([transaction])
    await network.broadcast([transaction])
  }

  _createNewWallet () {
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
  
  /* Communicate with the users */
  
  async sendWithdrawReply () {
    logger.warn('No generic sendWithdrawReply available, use platform version.')
  } 
  
  
}

module.exports = User
