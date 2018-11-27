'use strict'

const User = require('../platforms/reddit/user')
const logger = require('../services/logger')

class Help {
  constructor (username) {
    this.user = new User(username)
  }

  async sendHelp () {
    try {
      const address = await this.user.getAddress()

      return await this.user.sendHelpReply(address)
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }
}

module.exports = Help
