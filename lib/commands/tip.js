'use strict'
const messages = require('../config/messages')
const coinmarketcap = require('../services/coinmarketcap')
const logger = require('../services/logger')
const Send = require('./send')
const Reddit = require('../utils/messenger/reddit')
const messengerReddit = new Reddit()

class Tip extends Send {
  constructor (sender, receiver, arktoshis, mainnet, platform, receiverPlatform, submissionID) {
    super(sender, receiver, arktoshis, mainnet, platform, receiverPlatform)
    this.submissionID = submissionID
  }

  async sendTransaction () {
    try {
      this.__testSendToSelf()

      if (!this.__amountLargerThanMinimum()) {
        const message = messages.minimumValueMessage(this.platform)
        switch (this.platform) {
          case 'reddit':
          default:
            const subject = 'ArkTippr transaction failed - Amount to low'
            await this.__sendReddit(this.sender.username, message, subject, this.platform)
            break
          case 'whatsapp':
            await this.__sendWhatsApp(this.sender.username, message)
            break
        }
        throw new Error('Amount smaller than minimal value.')
      }

      await this.__senderHasBalance()
      const transactionId = await this.__sendTransaction()
      if (!transactionId) {
        throw new Error('Bad transaction.')
      }

      await this.__sendReply(transactionId)

      return true
    } catch (error) {
      logger.error(error.message)
      switch (this.receiverPlatform) {
          case 'reddit':
          default:
            const commentReply = messages.noBalanceNotification(this.receiverPlatform)
            await messengerReddit.postComment(this.submissionID, commentReply)
      }
    }
    return false
  }

  /**
  * @dev Send notifications to sender and receiver
  **/
  async __sendReply (transactionId) {
    const usd = await coinmarketcap.arkToshiToUSD(this.arktoshis)
    const amount = this.__formatBalance(this.arktoshis)

    const transactionReplyMessage = messages.transactionMessage(this.receiver.username, amount, usd, transactionId, this.platform)
       switch (this.platform) {
      case 'reddit':
      default:
        const subject = 'You directly sent Ark via ArkTippr!'
        await this.__sendReddit(this.sender.username, transactionReplyMessage, subject, this.platform)
        break
      case 'whatsapp':
        await this.__sendWhatsApp(this.sender.username, transactionReplyMessage)
        break
    }

    const address = await this.receiver.getAddress()
    const transactionReceiveMessage = messages.transactionReceiveMessage(this.sender.username, amount, usd, address, transactionId, this.receiverPlatform)
    const commentReply = messages.tipNotification(this.receiver.username, amount, usd, transactionId, this.receiverPlatform) + messages.footer(this.receiverPlatform)
    switch (this.receiverPlatform) {
      case 'reddit':
      default:
        const subject = 'You\'ve got Ark!'
        await this.__sendReddit(this.receiver.username, transactionReceiveMessage, subject, this.receiverPlatform)
        await messengerReddit.postComment(this.submissionID, commentReply)
        break
      case 'whatsapp':
        await this.__sendWhatsApp(this.receiver.username, transactionReceiveMessage)
        break
    }
  }
}

module.exports = Tip
