'use strict'

const User = require('../utils/user')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')

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
      await this._senderHasBalance()
      logger.info(`User ${this.sender.username} has sufficient balance for this transaction.`)
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

  _testSendToSelf () {
    if (this.sender.username === this.receiver.username) {
      throw new Error(`${this.sender.username} is trying to send tip to self.`)
    }
  }

  async _senderHasBalance () {
    let balance = parseInt(await this.sender.getBalance(this.mainnet), 10)
    const fee = parseInt(await this.mainnet.getFee(), 10)

    logger.error(`Fee: ${fee}, Balance: ${balance}`)
    if (!Number.isSafeInteger(balance) || !Number.isSafeInteger(fee)) {
      throw new RangeError('Bad input checking balance and fee.')
    }

    if (balance + fee < this.arktoshis) {
      this.sender.sendNotEnoughBalanceReply(this.arktoshis)
      throw new Error((`${this.sender.username} has insufficient balance for this transaction.`))
    }
    logger.info(`${this.sender.username} has sufficient balance for this transaction.`)
    return true
  }

  async _sendReply (txID) {
    const usd = await coinmarketcap.arkToshiToUSD(this.arktoshis)
    await this.sender.sendTransactionReply(txID, this.arktoshis, usd, this.mainnet)
    await this.receiver.sendTransactionReceiveReply(this.sender.username, txID, this.arktoshis, usd, this.mainnet)
  }

  async _sendTransaction () {
    try {
      const passphrase = await this.sender.getSeed()
      const recepient = await this.receiver.getAddress()
      const amount = this.arktoshis
      const transactionId = this.mainnet.send(passphrase, recepient, amount)

      return transactionId
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }
}

module.exports = Send
