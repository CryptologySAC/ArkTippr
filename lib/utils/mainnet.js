'use strict'

const network = require('../services/network')
const logger = require('../services/logger')
const Joi = require('joi')
const schema = {
  address: Joi.string().length(34).required()
}
const ArkToshis = 100000000

class Mainnet {
 /**
  * @dev Initialize the Ark mainnet and connect to it
  **/
  async initMainNet () {
    const net = 'mainnet'
    await network.setNetwork(net)
    await network.connect(net)
    this.symbol = network.network.config.symbol
  }

 /**
  * @dev Retreive the balance of an address from the network and return a formatted string.
  * @param {string} arkAddress The Ark wallet to get the balance of
  * @returns  {string} Formatted string with balance of the wallet
  **/
  async getBalance (arkAddress) {
    try {
      Joi.validate({ address: arkAddress }, schema, (err) => {
        if (err) {
          throw new Error('Please enter a valid formatted address.')
        }
      })

      const balance = await network.getFromNode(`/api/accounts?address=${arkAddress}`)
      if (!balance.data.hasOwnProperty('success') || !balance.data.success) {
        const errorMsg = balance.data.hasOwnProperty('error') && balance.data.error
            ? balance.data.error : 'Failed to retrieve wallet status from node.'
        throw new Error(errorMsg)
      }
      const confirmedBalance = this.formatBalance(balance.data.account.balance)
      const unConfirmedBalance = this.formatBalance(balance.data.account.unconfirmedBalance)

      return confirmedBalance === unConfirmedBalance ? confirmedBalance : `${confirmedBalance} pending: ${unConfirmedBalance}`
    } catch (error) {
      logger.warn(error.message)
      return this.formatBalance(0)
    }
  }

 /**
  * @dev  Format inputted balance to a string
  * @param {integer} amount The amount in Arktoshi
  * @returns  String with amount
  **/
  formatBalance (amount) {
    amount = parseInt(amount, 10)

    if (!Number.isSafeInteger(amount)) {
      amount = 0
    }

    const balance = parseFloat(amount / ArkToshis).toFixed(8)
    const symbol = typeof (this.symbol) !== 'undefined' ? `${this.symbol} ` : ''
    return `${symbol}${balance}`
  }
}

module.exports = new Mainnet()
