'use strict'

const logger = require('../services/logger')

class Help {
  constructor (user, subject) {
    this.user = user
    this.subject = subject
  }

  async sendHelp () {
    try {
      return await this.user.sendHelpReply(this.subject)
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }
}

module.exports = Help
