'use strict'
const logger = require('../services/logger')

class Deposit {
  constructor (user) {
    this.user = user
  }

  async sendDeposit () {
    try {
      return await this.user.sendDepositReply()
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }
}

module.exports = Deposit
