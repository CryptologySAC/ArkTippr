'use strict'

const Joi = require('joi')
const User = require('../platforms/reddit/user')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')

const _COMMANDS = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'SEND', 'VOTE', 'HELP', 'ADDRESS', 'DONATE', 'STICKERS', 'TIP']
const schema = {
  address: Joi.string().length(34).optional(),
  smartbridge: Joi.string().max(64, 'utf8').allow('').optional(), // Change to 255 in v2
  passphrase: Joi.string().optional(),
  secondSecret: Joi.string().allow('').optional(),
  amount: Joi.number().integer().min(1).optional()
}

require('dotenv').config()
const redditUser = process.env.REDDIT_USER

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
         throw new Error('No amount or currency')
      }

      let amountCurrency
      if (typeof (amount) === 'undefined') {
        amountCurrency = coinmarketcap.parseAmountCurrency(currency)

        if (amountCurrency === false) {
          throw new Error('Bad input in currency argument and amount undefined')
        }
      } else if (typeof (currency) === 'undefined') {
        amountCurrency = coinmarketcap.parseAmountCurrency(amount)

        if (amountCurrency === false) {
          throw new Error('Bad input in amount argument and currency undefined')
        }
      } else {
        amountCurrency = coinmarketcap.parseAmountCurrency(amount + currency)

        if (amountCurrency === false) {
          throw new Error('Bad input in amount argument and currency undefined')
        }
      }

      if (typeof (amountCurrency.amount) === 'undefined' || typeof (amountCurrency.currency) === 'undefined') {
        throw new Error('Bad Amount or Currency')
      }

      amount = amountCurrency.amount
      currency = amountCurrency.currency

      switch (currency) {
        case 'Ѧ':
          currency = 'ARK'
          break
        case '$':
          currency = 'USD'
          break
        case '€':
          currency = 'EUR'
          break
      }

      const arkToshiValue = await coinmarketcap.amountToArktoshi(amount, currency)

      return arkToshiValue !== null ? { arkToshiValue, amount, currency } : null
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
      const username = `u/${redditUser}`.toUpperCase()
      const mentionIndex = this._commandIndex(username, bodyParts)
      const command = bodyParts[mentionIndex - 1]

      switch (command) {
        case 'STICKERS':
          logger.info('Mention received: STICKERS')
          return { command }

        default:
          // Most likely a tip
          let amount = bodyParts[mentionIndex - 2]
          let currency = bodyParts[mentionIndex - 1]
          let smallFooter = bodyParts[mentionIndex + 1] === '~' ? true: false

          // In case we have 'something 10, something 10USD, 10USD, 10' we don't need the first argument
          if (typeof (amount) === 'undefined' || (!coinmarketcap.isCurrency(currency) && !coinmarketcap.isCurrency(amount))) {
            amount = ''
          }

          const arkToshiValue = await this.parseAmount(amount, currency)

          if (arkToshiValue !== null && arkToshiValue.arkToshiValue !== null) {
            logger.info('Mention received: TIP')
            return {command: 'TIP', arkToshiValue: arkToshiValue.arkToshiValue, check: arkToshiValue, smallFooter}
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
logger.info(`COMMAND PARSED: ${arg1} ${arg2} ${arg3}`)
      switch (command) {
        case 'SEND': // SEND [<username> <amount> [currency]]
          if (await receiver.isValidUser()) {
            // In case we have 'something 10, something 10USD, 10USD, 10' we don't need the last argument
            if ((parseFloat(arg2).toString() === arg2 && coinmarketcap.isCurrency(arg3)) ||
              (parseFloat(arg3).toString() === arg3 && coinmarketcap.isCurrency(arg2))) {
              // regular amount/number combination
            } else if (typeof (arg3) === 'undefined' ||
              (!coinmarketcap.isCurrency(arg3) && !coinmarketcap.isCurrency(arg2)) ||
              (coinmarketcap.parseAmountCurrency(arg2) !== false && coinmarketcap.isCurrency(arg3))) {
              arg3 = ''
            }

            arkToshiValue = await this.parseAmount(arg2, arg3)
            if (arkToshiValue !== null && arkToshiValue.arkToshiValue !== null) {
              return {command, arkToshiValue: arkToshiValue.arkToshiValue, username: arg1.replace('u/', ''), check: arkToshiValue}
            }
          }
          return {command}

        case 'STICKERS': // STICKERS [username]
          if (await receiver.isValidUser()) {
            return {command, username: arg1.replace('u/', '')}
          }
          return {command}
        case 'DONATE': // DONATE [<amount> [currency]]

          // In case we have 'something 10, something 10USD, 10USD, 10' we don't need the last argument
            if ((parseFloat(arg1).toString() === arg1 && coinmarketcap.isCurrency(arg2)) ||
              (parseFloat(arg2).toString() === arg2 && coinmarketcap.isCurrency(arg1))) {
              // regular amount/number combination
            } else if (typeof (arg2) === 'undefined' ||
              (!coinmarketcap.isCurrency(arg2) && !coinmarketcap.isCurrency(arg1)) ||
              (coinmarketcap.parseAmountCurrency(arg1) !== false && coinmarketcap.isCurrency(arg2))) {
              arg2 = ''
            }

          arkToshiValue = await this.parseAmount(arg1, arg2)

          if (arkToshiValue !== null && arkToshiValue.arkToshiValue !== null) {
            return {command, arkToshiValue: arkToshiValue.arkToshiValue, username: redditUser, check: arkToshiValue}
          }
          return {command}
        case 'WITHDRAW': // WITHDRAW [<address> <amount> [currency]]

          // In case we have 'something 10, something 10USD, 10USD, 10' we don't need the last argument
          if ((parseFloat(arg2).toString() === arg2 && coinmarketcap.isCurrency(arg3)) ||
            (parseFloat(arg3).toString() === arg3 && coinmarketcap.isCurrency(arg2))) {
            // regular amount/number combination
          } else if (typeof (arg3) === 'undefined' ||
            (!coinmarketcap.isCurrency(arg3) && !coinmarketcap.isCurrency(arg2)) ||
            (coinmarketcap.parseAmountCurrency(arg2) !== false && coinmarketcap.isCurrency(arg3))) {
            arg3 = ''
          }

          arkToshiValue = await this.parseAmount(arg2, arg3)
          if (arkToshiValue !== null && arkToshiValue.arkToshiValue !== null) {
            if (this.validateInput(arkToshiValue.arkToshiValue, arg1)) {
              return {command, arkToshiValue: arkToshiValue.arkToshiValue, address: arg1, check: arkToshiValue}
            }
          }

          if ((arkToshiValue === null || arkToshiValue.arkToshiValue === null) && this.validateInput(1, arg1)) {
            return {command, arkToshiValue: null, address: arg1}
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
