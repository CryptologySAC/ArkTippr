'use strict'

const User = require('./user')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')
const Joi = require('joi')
const _COMMANDS = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'SEND', 'VOTE', 'HELP', 'ADDRESS', 'DONATE', 'STICKERS', 'TIP']
const schema = {
  address: Joi.string().length(34).optional(),
  smartbridge: Joi.string().max(64, 'utf8').allow('').optional(), // Change to 255 in v2
  passphrase: Joi.string().optional(),
  secondSecret: Joi.string().allow('').optional(),
  amount: Joi.number().integer().min(1).optional()
}

require('dotenv').config()

const minimalArktoshiValue = parseInt(process.env.MIN_ARKTOSHI_VALUE, 10)

class Parser {
  /**
  * @dev Parse a amount/currency combination and return it's value in Arktoshi
  * @param {string} amount    the expected amount
  * @param {string} currency  the expected currency symbol
  * @returns Value in Arktoshi or null
  **/
  async parseAmount (amount, currency) {
    if (typeof (amount) === 'undefined' && typeof (currency) === 'undefined') {
       return null
    }

    const arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
    return arkToshiValue
  }

  /**
  * @dev  Parse an array to see if it contains a valid tip
  * @param {array} bodyParts The strings to parse
  * @returns Object { command, arkToshiValue } or null
  **/
  async parseMention (body) {
    try {
      const bodyParts = body.toUpperCase().trim().split(/\s+/)
      const username = `u/${process.env.REDDIT_USER}`.toUpperCase()
      const mentionIndex = this._commandIndex(username, bodyParts)
      const command = bodyParts[mentionIndex - 1]

      switch (command) {
        case 'STICKERS':
          logger.info('Mention of Tipbot received: STICKERS')
          return { command }

        default:
          // Most likely a tip
          const amount = bodyParts[mentionIndex - 2]
          const currency = bodyParts[mentionIndex - 1]
          const arkToshiValue = await this.parseAmount(amount, currency)

          if (arkToshiValue !== null && arkToshiValue >= minimalArktoshiValue) {
            logger.info(`Tip mention received: ${amount} ${currency} = ${arkToshiValue} ArkToshis.`)
            return {command: 'TIP', arkToshiValue}
          } else if (arkToshiValue !== null) {
            // Minimal value not reached
            logger.warn(`Tip mention received: ${amount} ${currency} = ${arkToshiValue} ArkToshis. Below minimal value.`)
            return {command: 'TIP', arkToshiValue: 0}
          }
      }
    } catch (error) {
      logger.warn(error.message)
    }

    return null
  }

  /**
  * @dev  Parse an array to see if it contains a valid command and execute that command
  * @param {array} bodyParts The strings to parse
  **/
  async parseCommand (body) {
    try {
      const bodyParts = body.toUpperCase().trim().split(/\s+/)
      const commands = []

      // We allow multiple commands per PM.
      bodyParts.forEach(item => {
        if (_COMMANDS.includes(item)) { commands.push(item) }
      })

      // Process Commands
      const execute = []
      for (let item in commands) {
        const command = commands[item]
        const todo = await this._checkCommand(command, bodyParts)
        if (todo !== null) {
          execute.push(todo)
        }
      }
      return execute
    } catch (error) {
      logger.warn(error.message)
    }

    return null
  }

  async _checkCommand (command, bodyParts) {
    switch (command) {
      case 'BALANCE':
      case 'TIP':
      case 'DEPOSIT':
      case 'ADDRESS':
      case 'VOTE':
      case 'HELP':
        // All commands that need no additional parsing for arguments
        return {command}

      case 'SEND':
      case 'DONATE':
      case 'WITHDRAW':
      case 'STICKERS':
        const args = await this._parseArguments(command, bodyParts)
        return args

      default:
        return null
    }
  }

 /**
  * @dev Find the needle in the array and return it's index
  * @param {string} needle Reddit username
  * @param {array[string]} bodyParts Split up body all caps
  * @returns index or -1
  **/
   _commandIndex (needle, bodyParts) {
    const index = parseInt(bodyParts.indexOf(needle), 10)

    if (index < 0) {
      // We know it's there
      for (let item in bodyParts) {
        if (bodyParts[item].includes(needle)) {
          return parseInt(item, 10)
        }
      }
    }
    return index
  }

  async _parseArguments (command, bodyParts) {
    try {
      const commandIndex = this._commandIndex(command, bodyParts)
      const arg1 = bodyParts[commandIndex + 1]
      const arg2 = bodyParts[commandIndex + 2]
      const arg3 = bodyParts[commandIndex + 3]

      let arkToshiValue = null
      const receiver = new User(arg1)

      // if the first argument is bad, or undefined then this is a request for help
      if (typeof (arg1) === 'undefined') {
        return {command}
      }

      switch (command) {
        case 'SEND': // SEND [<username> <amount> [currency]]
logger.warn('SEND')
          if (await receiver.isValidUser()) {
            arkToshiValue = await this.parseAmount(arg3, arg2)
            if (arkToshiValue !== null) {
              return {command, arkToshiValue, username: arg1}
            }
          }
          return {command}

        case 'STICKERS': // STICKERS [username]
          if (await receiver.isValidUser()) {
            return {command, username: arg1}
          }
          return {command}
        case 'DONATE': // DONATE [<amount> [currency]]
          arkToshiValue = await this.parseAmount(arg2, arg1)
          if (arkToshiValue !== null) {
            const username = process.env.REDDIT_USER
            return {command, arkToshiValue, username}
          }
          return {command}
        case 'WITHDRAW': // WITHDRAW [<address> <amount> [currency]]
          arkToshiValue = await this.parseAmount(arg3, arg2)
          if (this.validateInput(arkToshiValue, arg1)) {
            return {command, arkToshiValue, address: arg1}
          }
          return {command}
      }
    } catch (error) {
      logger.warn(error.message)
    }
    return null
  }

 /**
  * @dev  Validate transaction variables
  **/
  validateInput (amount, address, passphrase, smartbridge, secondSecret) {
    return Joi.validate({
      address,
      smartbridge,
      passphrase,
      secondSecret,
      amount
    }, schema, (err) => {
      if (err) {
        logger.error(err)
        return false
      }
      return true
    })
  }
}

module.exports = Parser
