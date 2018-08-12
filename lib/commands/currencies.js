'use strict'

const logger = require('../services/logger')
const messages = require('../config/messages')
const Help = require('./help')

const WhatsApp = require('../utils/messenger/whatsapp')
const messengerWhatsApp = new WhatsApp()

class Currencies extends Help {
  async __sendReddit () {
    return true
  }

  async __sendWhatsApp () {
    try {
      const message = messages.helpWithdrawMessage(this.platform)
      await messengerWhatsApp.sendMessage(this.username, message)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }
}

module.exports = Currencies
