'use strict'

const logger = require('../services/logger')
const messages = require('../config/messages')
const Message = require('../utils/messenger/reddit')
const messenger = new Message()

class Help {
  constructor (username) {
    this.username = username
  }

  async sendHelp () {
    try {
      logger.info(`${this.username} has been notified of SEND HELP.`)
      const message = messages.helpMessage()
      const subject = 'ArkTippr Help'
      await messenger.sendMessage(this.username, message, subject)
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }
}

module.exports = Help
