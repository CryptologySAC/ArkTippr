'use strict'

const logger = require('../services/logger')
const messages = require('../config/messages')
const Reddit = require('../utils/messenger/reddit')
const WhatsApp = require('../utils/messenger/whatsapp')
const messengerReddit = new Reddit()
const messengerWhatsApp = new WhatsApp()

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
this.platform = 'whatsapp'
this.username = '+31638053467'
await this.sendWhatsApp()
    return messageSentOK
  }

  async sendReddit () {
    try {
      const message = messages.helpMessage(this.platform) + messages.footer()
      const subject = 'ArkTippr Help'
      await messengerReddit.sendMessage(this.username, message, subject)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }
  
  async sendWhatsApp () {
    try {
      const message = messages.helpMessage(this.platform)
      await messengerWhatsApp.sendMessage (this.username, message)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }
}

module.exports = Help
