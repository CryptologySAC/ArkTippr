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

class Parser {
  /**
  * @dev Parse a amount/currency combination and return it's value in Arktoshi
  * @param {string} amount    the expected amount
  * @param {string} currency  the expected currency symbol
  * @returns Value in Arktoshi or null
  **/
  async parseAmount (amount, currency) {
    try {
      if (typeof (amount) === 'undefined' && typeof (currency) === 'undefined') {
         throw new Error('No amount nor currency')
      }

      if (typeof (amount) === 'undefined') {
        const amountCurrency = coinmarketcap.parseAmountCurrency(currency)

        if (amountCurrency === false) {
          throw new Error('Bad input in currency argument and amount undefined')
        }

        amount = amountCurrency.amount
        currency = amountCurrency.currency
      }

      if (typeof (currency) === 'undefined') {
        const amountCurrency = coinmarketcap.parseAmountCurrency(amount)

        if (amountCurrency === false) {
          throw new Error('Bad input in amount argument and currency undefined')
        }

        amount = amountCurrency.amount
        currency = amountCurrency.currency
      }

      const arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)
      return arkToshiValue
    } catch (error) {
      return null
    }
  }

  /**
  * @dev  Parse an array to see if it contains a valid tip
  * @param {array} bodyParts The strings to parse
  * @returns Object { command, arkToshiValue } or null
  **/
  async parseMention (body) {
    try {
      if (typeof (body) === 'undefined') {
        return null
      }

      const bodyParts = body.toUpperCase().trim().split(/\s+/)
      const username = `u/${process.env.REDDIT_USER}`.toUpperCase()
      const mentionIndex = this._commandIndex(username, bodyParts)
      const command = bodyParts[mentionIndex - 1]

      switch (command) {
        case 'STICKERS':
          logger.info('Mention received: STICKERS')
          return { command }

        default:
          // Most likely a tip
          let amount = bodyParts[mentionIndex - 2]
          const currency = bodyParts[mentionIndex - 1]

          if (typeof (amount) === 'undefined') {
            amount = ''
          }

          const arkToshiValue = await this.parseAmount(amount, currency)

          if (arkToshiValue !== null) {
            logger.info('Mention received: TIP')
            return {command: 'TIP', arkToshiValue}
          }
      }
    } catch (error) {
      logger.warn(error)
    }

    return null
  }

  /**
  * @dev  Parse a string to see if it contains a valid command and execute that command
  * @param {array} bodyParts The strings to parse
  **/
  async parseCommand (body) {
    try {
      if (typeof (body) === 'undefined') {
        return null
      }

      const bodyParts = body.trim().split(/\s+/)

      // We allow multiple commands per PM.
      // Process Commands
      const execute = []
      for (let item in bodyParts) {
        const command = bodyParts[item].toUpperCase()
        if (_COMMANDS.includes(command)) {
          const index = parseInt(item, 10)
          const argumentsBody = bodyParts.slice(index, index + 4)
          const todo = await this._checkCommand(command, argumentsBody)
          if (todo !== null) {
            logger.info(`Command received: ${command} => ${JSON.stringify(todo)}`)
            execute.push(todo)
          }
        }
      }
      return execute.length ? execute : null
    } catch (error) {
      logger.warn(error)
    }

    return null
  }

  async _checkCommand (command, bodyParts) {
    if (typeof (command) === 'undefined') {
      return null
    }

    command = command.toUpperCase()
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
    needle = needle.toUpperCase()
    const index = parseInt(bodyParts.indexOf(needle), 10)

    if (index < 0) {
      // We know it's there
      for (let item in bodyParts) {
        let haystack = bodyParts[item].toUpperCase()
        if (haystack.includes(needle)) {
          return parseInt(item, 10)
        }
      }
    }
    return index
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
        return false
      }
      return true
    })
  }

  async _parseArguments (command, bodyParts) {
    try {
      const commandIndex = this._commandIndex(command, bodyParts)
      const arg1 = bodyParts[commandIndex + 1]
      let arg2 = bodyParts[commandIndex + 2]
      let arg3 = bodyParts[commandIndex + 3]

      if (typeof (arg2) === 'undefined') {
        arg2 = ''
      }

      if (typeof (arg3) === 'undefined') {
        arg3 = ''
      }

      let arkToshiValue = null
      const receiver = new User(arg1)

      // if the first argument is bad, or undefined then this is a request for help
      if (typeof (arg1) === 'undefined' || _COMMANDS.includes(arg1.toUpperCase())) {
        return {command}
      }

      switch (command) {
        case 'SEND': // SEND [<username> <amount> [currency]]
          if (await receiver.isValidUser()) {
            arkToshiValue = await this.parseAmount(arg3, arg2)
            if (arkToshiValue !== null) {
              return {command, arkToshiValue, username: arg1.replace('u/', '')}
            }
          }
          return {command}

        case 'STICKERS': // STICKERS [username]
          if (await receiver.isValidUser()) {
            return {command, username: arg1.replace('u/', '')}
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

          if (arkToshiValue === null && this.validateInput(1, arg1)) {
            return {command, arkToshiValue, address: arg1}
          }
          return {command}
      }
    } catch (error) {
      logger.error(error)
    }
    return null
  }
}

module.exports = Parser
