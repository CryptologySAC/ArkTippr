'use strict'
require('dotenv').config()

const User = require('./user')
const logger = require('../../services/logger')
const database = require('../../services/database')
const Joi = require('joi')
const validateWhatsApp = Joi.extend(require('joi-phone-number'))

const ARKTIPPER = process.env.ADDRESS_ARKTIPPR
const TWILIO_PHONENUMBER = process.env.TWILIO_PHONENUMBER

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
    const isValid = await validateWhatsApp.string().phoneNumber({format: 'e164'}).validate(this.username)
    .then(() => {
      logger.error(`USERNAME: ${this.username} OK`)
      return true
    })
    .catch(() => {
      logger.error(`USERNAME: ${this.username} WRONG`)
      return false
    })

    return isValid
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
    if (username.toLowerCase() === TWILIO_PHONENUMBER) {
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
}
module.exports = redditUser
