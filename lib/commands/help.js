'use strict'

const logger = require('../services/logger')
const messages = require('../config/messages')
const Reddit = require('../utils/messenger/reddit')
const messengerReddit = new Reddit()

class Help {
  constructor (username, platform) {
    this.username = username
    this.platform = platform
  }

  async sendHelp () {
    let messageSentOK

    switch (this.platform) {
      case 'reddit':
      default:
        messageSentOK = await this.sendReddit()
    }

    return messageSentOK
  }

  async sendReddit () {
    try {
      const message = messages.helpMessage() + messages.footer()
      const subject = 'ArkTippr Help'
      await messengerReddit.sendMessage(this.username, message, subject)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }
}

module.exports = Help
