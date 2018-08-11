'use strict'

const User = require('../utils/user/user')
const logger = require('../services/logger')

class Deposit {
  constructor (username) {
    this.user = new User(username)
  }

  async sendDeposit () {
    try {
      const address = await this.user.getAddress()

      return await this.user.sendDepositReply(address)
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }
}

module.exports = Deposit
