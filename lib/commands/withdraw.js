'use strict'

const logger = require('../services/logger')
const Send = require('./send')

class Withdraw extends Send {
  constructor (sender, address, arktoshis, mainnet) {
    super(sender, null, arktoshis, mainnet)
    this.address = address
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
    await this.sender.sendWithdrawReply(txID, this.arktoshis, this.address)
  }

   /**
  * @dev Test if the intended transaction is large enough
  * @returns true if it is
  **/
  _amountLargerThanMinimum () {
    return (true)
  }
}
module.exports = Withdraw
