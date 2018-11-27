'use strict'

const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')
const Send = require('./send')
const User = require('../platforms/reddit/user')
const crypto = require('crypto')

require('dotenv').config()
const stickerPriceArktoshi = parseInt(process.env.ARKSTICKERS_PRICE, 10)
const stickerUsername = process.env.ARKSTICKERS_USERNAME
const arkStickers = new User(stickerUsername)
const arkStickersAddress = process.env.ADDRESS_ARKSTICKERS

class Stickers extends Send {
  constructor (sender, receiver, mainnet) {
    super(sender, receiver, stickerPriceArktoshi, mainnet)
  }

  _testSendToSelf () {
    return false
  }

  _generateCode () {
    const now = Date.now().toString()
    const secret = this.sender.username + this.receiver.username + now + process.env.CRYPTO_PASS
    const hash = crypto.createHmac('sha256', secret).update('ArkStickers,com').digest('hex')

    const lastNumber = now.slice(-1)
    const key = hash.substr(lastNumber, 5)

    return key.toUpperCase()
  }

  /**
  * @dev Create and post the transaction to the network
  * @returns transactionId or null
  **/
  async _sendTransaction () {
    try {
      const passphrase = await this.sender.getSeed()
      const recepient = arkStickersAddress
      const amount = this.arktoshis
      this.transactionId = await this.mainnet.send(passphrase, recepient, amount)
      return this.transactionId
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

  async _sendReply (txID) {
    const stickerCode = this._generateCode()
    const usd = await coinmarketcap.arkToshiToUSD(this.arktoshis)
    await this.sender.sendStickerSendReply(txID, this.arktoshis, usd, this.receiver.username)
    await arkStickers.sendNewStickerCode(txID, stickerCode)
    await this.receiver.sendStickerCode(this.sender.username, stickerCode)
  }

  async sendMentionReply (submissionID) {
    await this.receiver.sendStickersReply(submissionID, this.transactionId)
  }
}
module.exports = Stickers
