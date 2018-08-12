'use strict'

const logger = require('../services/logger')
const messages = require('../config/messages')
const Help = require('./help')

const Reddit = require('../utils/messenger/reddit')
const messengerReddit = new Reddit()

const WhatsApp = require('../utils/messenger/whatsapp')
const messengerWhatsApp = new WhatsApp()

class SendHelp extends Help {
  async __sendReddit () {
    try {
      const message = messages.helpSendMessage(this.platform) + messages.footer(this.platform)
      const subject = 'ArkTippr Help - Send'
      await messengerReddit.sendMessage(this.username, message, subject)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async __sendWhatsApp () {
    try {
      const message = messages.helpSendMessage(this.platform)
      await messengerWhatsApp.sendMessage(this.username, message)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }
}

module.exports = SendHelp
