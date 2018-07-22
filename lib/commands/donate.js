'use strict'

const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')
const Send = require('./send')

class Donate extends Send {
  async sendDonation () {
    try {
      this._testSendToSelf()
      await this._senderHasBalance()
      logger.info(`User ${this.sender.username} has sufficient balance for this donation.`)
      const transactionId = await this._sendTransaction()
      if (!transactionId) {
        throw new Error('Bad transaction.')
      }

      await this._sendReply(transactionId)

      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async _sendReply (txID) {
    const usd = await coinmarketcap.arkToshiToUSD(this.arktoshis)
    await this.sender.sendDonationReply(txID, this.arktoshis, usd, this.mainnet)
    await this.receiver.sendTransactionReceiveReply(this.sender.username, txID, this.arktoshis, usd, this.mainnet)
  }
}

module.exports = Donate
