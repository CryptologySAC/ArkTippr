'use strict'

const User = require('../utils/user/user')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')
const messages = require('../config/messages')

const Reddit = require('../utils/messenger/reddit')
const messengerReddit = new Reddit()

const WhatsApp = require('../utils/messenger/whatsapp')
const messengerWhatsApp = new WhatsApp()

class Balance {
  constructor (username, mainnet, platform) {
    this.user = new User(username)
    this.username = this.user.username
    this.mainnet = mainnet
    this.platform = platform
  }

  async sendBalance () {
    try {
      let balance = await this.user.getBalance(this.mainnet)
      let usdValue

      if (balance !== null) {
        usdValue = await coinmarketcap.arkToshiToUSD(balance)
        balance = this.mainnet.formatBalance(balance)
      }

      let messageSentOK

      switch (this.platform) {
        case 'reddit':
        default:
          messageSentOK = await this.__sendReddit(balance, usdValue)
          break
        case 'whatsapp':
          messageSentOK = await this.__sendWhatsApp(balance, usdValue)
          break
      }
      return messageSentOK
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async __sendReddit (balance, usdValue) {
    try {
      let message
      if (balance === null) {
        message = messages.noBalanceMessage(this.platform)
      } else {
        message = messages.balanceMessage(balance, usdValue, this.platform)
      }
      message = message + messages.footer(this.platform)
      const subject = 'Your ArkTippr wallet balance'
      await messengerReddit.sendMessage(this.username, message, subject)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async __sendWhatsApp (balance, usdValue) {
    try {
      let message
      if (balance === null) {
        message = messages.noBalanceMessage(this.platform)
      } else {
        message = messages.balanceMessage(balance, usdValue, this.platform)
      }
      await messengerWhatsApp.sendMessage(this.username, message)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }
}

module.exports = Balance
