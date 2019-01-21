'use strict'

const coinmarketcap = require('../services/coinmarketcap')
const logger = require('../services/logger')
const Send = require('./send')

class Tip extends Send {
  constructor (sender, receiver, arktoshis, mainnet, submissionID, parentID, smallFooter = false) {
    super(sender, receiver, arktoshis, mainnet)
    this.submissionID = submissionID
    this.vendorField = `ArkTippr ${sender} -> ${receiver} R:${parentID.replace('t1_', '')}`
    this.smallFooter = smallFooter
  }

  async sendTransaction () {
    try {
      this._testSendToSelf()

      if (!this._amountLargerThanMinimum()) {
        this.sender.sendMinimalAmountReply()
        throw new Error('Amount smaller than minimal value.')
      }

      await this._senderHasBalance()
      const transactionId = await this._sendTransaction(this.vendorField)
      if (!transactionId) {
        throw new Error('Bad transaction.')
      }

      await this._sendReply(transactionId)

      return true
    } catch (error) {
      logger.error(error.message)
      await this.receiver.sendTipNotification(this.submissionID)
      return false
    }
  }

  async sendReward () {
    try {
      this._testSendToSelf()

      if (!this._amountLargerThanMinimum()) {
        this.sender.sendMinimalAmountReply()
        throw new Error('Amount smaller than minimal value.')
      }

      await this._senderHasBalance()
      const transactionId = await this._sendTransaction(this.vendorField)
      if (!transactionId) {
        throw new Error('Bad transaction.')
      }

      await this._sendReply(transactionId)

      return transactionId
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async _sendReply (txID) {
    const usd = await coinmarketcap.arkToshiToUSD(this.arktoshis)
    await this.receiver.sendTipNotification(this.submissionID, txID, this.arktoshis, usd, this.smallFooter)
    await this.sender.sendTransactionReply(this.receiver.username, txID, this.arktoshis, usd)
    await this.receiver.sendTransactionReceiveReply(this.sender.username, txID, this.arktoshis, usd)
  }
}

module.exports = Tip
