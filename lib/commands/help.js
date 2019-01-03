'use strict'

const logger = require('../services/logger')

class Help {
  constructor (user) {
    this.user = user
  }

  async sendHelp () {
    try {
      return await this.user.sendHelpReply()
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }
}

module.exports = Help
