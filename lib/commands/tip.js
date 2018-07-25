'use strict'

const coinmarketcap = require('../services/coinmarketcap')
const Send = require('./send')

class Tip extends Send {
  constructor (sender, receiver, arktoshis, mainnet, submissionID) {
    super(sender, receiver, arktoshis, mainnet)
    this.submissionID = submissionID
  }

  async _sendReply (txID) {
    const usd = await coinmarketcap.arkToshiToUSD(this.arktoshis)
    await this.receiver.sendTipNotification(this.submissionID, txID, this.arktoshis, usd)
    await this.sender.sendTransactionReply(this.receiver.username, txID, this.arktoshis, usd)
    await this.receiver.sendTransactionReceiveReply(this.sender.username, txID, this.arktoshis, usd)
  }
}

module.exports = Tip
