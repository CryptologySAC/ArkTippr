'use strict'

const logger = require('../services/logger')
const messages = require('../config/messages')
const Help = require('./help')

const Reddit = require('../utils/messenger/reddit')
const messengerReddit = new Reddit()

class TipHelp extends Help {
  async __sendReddit () {
    try {
      const message = messages.helpTipMessage(this.platform) + messages.footer(this.platform)
      const subject = 'ArkTippr Help - Tipping'
      await messengerReddit.sendMessage(this.username, message, subject)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }
}

module.exports = TipHelp
