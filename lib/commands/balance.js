'use strict'
const logger = require('../services/logger')

class Balance {
  constructor (user, mainnet) {
    this.user = user
    this.mainnet = mainnet
  }

  async sendBalance () {
    try {
      let balance = await this.user.getBalance(this.mainnet)
      return await this.user.sendBalanceReply(balance)
    } catch (error) {
      logger.error(error)
      return null
    }
  }
}

module.exports = Balance
