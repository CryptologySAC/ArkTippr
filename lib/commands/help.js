'use strict'

const logger = require('../services/logger')
const messages = require('../config/messages')

const Reddit = require('../utils/messenger/reddit')
const messengerReddit = new Reddit()

const WhatsApp = require('../utils/messenger/whatsapp')
const messengerWhatsApp = new WhatsApp()

class Help {
  constructor (username, platform) {
    this.username = username
    this.platform = platform

    logger.info(`HELP COMMAND: ${this.username} ON ${this.platform}`)
  }

  async sendHelp () {
    let messageSentOK

    switch (this.platform) {
      case 'reddit':
      default:
        messageSentOK = await this.__sendReddit()
        break
      case 'whatsapp':
        messageSentOK = await this.__sendWhatsApp()
        break
    }
    return messageSentOK
  }

  async __sendReddit () {
    try {
      const message = messages.helpMessage(this.platform) + messages.footer(this.platform)
      const subject = 'ArkTippr Help'
      await messengerReddit.sendMessage(this.username, message, subject)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async __sendWhatsApp () {
    try {
      const message = messages.helpMessage(this.platform)
      await messengerWhatsApp.sendMessage(this.username, message)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }
}

module.exports = Help
