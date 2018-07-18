'use strict'

const network = require('../services/network')
const logger = require('../services/logger')
const Joi = require('joi')
const schema = {
  address: Joi.string().length(34).required()
}
const ArkToshis = 100000000

class Mainnet {
  async initMainNet () {
    const net = 'mainnet'
    await network.setNetwork(net)
    await network.connect(net)
    this.symbol = network.network.config.symbol
  }

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
      logger.error(error.message)
      return this.__formatBalance(0)
    }
  }

  formatBalance (amount) {
    const balance = amount / ArkToshis;
    const symbol = typeof (this.symbol) !== 'undefined' ? `${this.symbol} ` : ''
    return `${symbol}${balance}`
  }
}

module.exports = new Mainnet()
