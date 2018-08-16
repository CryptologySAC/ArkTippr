'use strict'

const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')
const Send = require('./send')
const RedditUser = require('../utils/user/reddit')
const WhatsAppUser = require('../utils/user/whatsapp')

class Withdraw extends Send {
  constructor (sender, address, arktoshis, mainnet, platform) {
    super(sender, null, arktoshis, mainnet, platform)
    this.address = address
  }

  async determineValue () {
    // send max amount
    let user
    switch (this.platform) {
      case 'reddit':
      default:
        user = new RedditUser(this.sender)
        break
      case 'whatsapp':
        user = new WhatsAppUser(this.sender)
        break
    }
    const balance = await user.getBalance(this.mainnet)
    const fee = await this.mainnet.getFee()

    this.arktoshis = parseInt(balance, 10) - parseInt(fee, 10)
  }

  async _sendTransaction () {
    try {
      const passphrase = await this.sender.getSeed()
      const recepient = this.address
      const amount = this.arktoshis
      const transactionId = await this.mainnet.send(passphrase, recepient, amount)
      return transactionId
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async _sendReply (txID) {
    const usd = await coinmarketcap.arkToshiToUSD(this.arktoshis)
    await this.sender.sendWithdrawReply(txID, this.arktoshis, usd)
  }
}
module.exports = Withdraw
