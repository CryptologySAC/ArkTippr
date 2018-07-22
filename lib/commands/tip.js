'use strict'

const User = require('../utils/user')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')
const Send = require('./send')

class Tip extends Send {
  constructor (sender, receiver, arktoshis, mainnet) {
    super(sender, receiver, arktoshis, mainnet)
  }

  async sendTip (submissionID) {
    try {
      this._testSendToSelf()
      await this._senderHasBalance()
      logger.info(`User ${this.sender.username} has sufficient balance for this transaction.`)
      const transactionId = await this._sendTransaction(submissionID)
      if (!transactionId) {
        throw new Error('Bad transaction.')
      }

      await this._sendReply(submissionID, transactionId)

      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async _sendReply (submissionID, txID) {
    const usd = await coinmarketcap.arkToshiToUSD(this.arktoshis)
    await this.receiver.sendTipNotification(submissionID, txID, this.arktoshis, usd, this.mainnet)
    await this.sender.sendTransactionReply(txID, this.arktoshis, usd, this.mainnet)
  }

  _testSendToSelf () {
    if (this.sender.username === this.receiver.username) {
      throw new Error(`${this.sender.username} is trying to send tip to self.`)
    }
  }
}

module.exports = Tip
