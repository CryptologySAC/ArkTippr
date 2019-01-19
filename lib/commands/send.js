'use strict'

const User = require('../platforms/reddit/user')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')

require('dotenv').config()
const minimalArktoshiValue = parseInt(process.env.MIN_ARKTOSHI_VALUE, 10)

class Send {
  constructor (sender, receiver, arktoshis, mainnet) {
    this.sender = new User(sender)
    this.receiver = new User(receiver)
    this.arktoshis = arktoshis
    this.mainnet = mainnet
  }

  async sendTransaction () {
    try {
      this._testSendToSelf()

      if (!this._amountLargerThanMinimum()) {
        this.sender.sendMinimalAmountReply()
        throw new Error('Amount smaller than minimal value.')
      }

      await this._senderHasBalance()
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

 /**
  * @dev Checks if the balance of the sender is sufficient for this transaction
  * @returns true or throws error
  **/
  async _senderHasBalance () {
    let balance = parseInt(await this.sender.getBalance(this.mainnet), 10)
    const fee = parseInt(await this.mainnet.getFee(), 10)

    if (!Number.isSafeInteger(balance) || !Number.isSafeInteger(fee)) {
      throw new RangeError('Bad input checking balance and fee.')
    }

    if (balance === 0 || balance + fee < this.arktoshis) {
      this.sender.sendNotEnoughBalanceReply(this.arktoshis)
      throw new Error((`${this.sender.username} has insufficient balance for this transaction.`))
    }
    logger.info(`${this.sender.username} has sufficient balance for this transaction.`)
    return true
  }

 /**
  * @dev Test if the intended transaction is large enough
  * @returns true if it is
  **/
  _amountLargerThanMinimum () {
    return (this.arktoshis >= minimalArktoshiValue)
  }

 /**
  * @dev Test if we are not trying to send to ourself
  * @returns false or throws error
  **/
  _testSendToSelf () {
    if (this.sender.username === this.receiver.username) {
      throw new Error(`${this.sender.username} is trying to send tip to self.`)
    }
    return false
  }

 /**
  * @dev Create and post the transaction to the network
  * @returns transactionId or null
  **/
  async _sendTransaction (vendorField = 'ArkTippr: The Ark Tipbot.') {
    try {
      const passphrase = await this.sender.getSeed()
      const recepient = await this.receiver.getAddress()
      const amount = this.arktoshis
      const transactionId = await this.mainnet.send(passphrase, recepient, amount, vendorField)
      return transactionId
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }

 /**
  * @dev Send notifications to sender and receiver
  **/
  async _sendReply (txID) {
    const usd = await coinmarketcap.arkToshiToUSD(this.arktoshis)
    await this.sender.sendTransactionReply(this.receiver.username, txID, this.arktoshis, usd)
    await this.receiver.sendTransactionReceiveReply(this.sender.username, txID, this.arktoshis, usd)
  }
}

module.exports = Send
