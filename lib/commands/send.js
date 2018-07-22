'use strict'

const User = require('../utils/user')
const logger = require('../services/logger')

class Send {
  constructor (sender, receiver, arktoshis, mainnet) {
    this.sender = new User(sender)
    this.receiver = new User(receiver)
    this.arktoshis = arktoshis
    this.mainnet = mainnet
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
