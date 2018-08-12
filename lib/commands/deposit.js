'use strict'

const RedditUser = require('../utils/user/reddit')
const WhatsAppUser = require('../utils/user/whatsapp')
const logger = require('../services/logger')
const Help = require('./help')

const messages = require('../config/messages')

const Reddit = require('../utils/messenger/reddit')
const messengerReddit = new Reddit()

const WhatsApp = require('../utils/messenger/whatsapp')
const messengerWhatsApp = new WhatsApp()

class Deposit extends Help {
  async sendHelp () {
    try {
      let user
      switch (this.platform) {
        case 'reddit':
        default:
          user = new RedditUser(this.username)
          break
        case 'whatsapp':
          user = new WhatsAppUser(this.username)
          break
      }

      const address = await user.getAddress()
      let messageSentOK

      switch (this.platform) {
        case 'reddit':
        default:
          messageSentOK = await this.__sendReddit(address)
          break
        case 'whatsapp':
          messageSentOK = await this.__sendWhatsApp(address)
          break
      }
      return messageSentOK
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async __sendReddit (address) {
    try {
      const message = messages.depositMessage(address, this.platform) + messages.footer(this.platform)
      const subject = 'Your ArkTippr wallet address'
      await messengerReddit.sendMessage(this.username, message, subject)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async __sendWhatsApp (address) {
    try {
      const message = messages.depositMessage(address, this.platform) + messages.footer(this.platform)
      await messengerWhatsApp.sendMessage(this.username, message)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }
}

module.exports = Deposit
