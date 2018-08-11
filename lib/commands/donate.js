'use strict'

const User = require('../utils/user/user')
const coinmarketcap = require('../services/coinmarketcap')
const Send = require('./send')

class Donate extends Send {
  async _sendReply (txID) {
    const donatedTo = new User('marcs1970')
    const usd = await coinmarketcap.arkToshiToUSD(this.arktoshis)
    await this.sender.sendDonationReply(txID, this.arktoshis, usd)
    await donatedTo.sendDonationReply(txID, this.arktoshis, usd)
  }
}

module.exports = Donate
