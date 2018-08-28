'use strict'
require('dotenv').config()

const messages = require('../config/messages')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')
const RedditUser = require('../utils/user/reddit')
const Reddit = require('../utils/messenger/reddit')
const messengerReddit = new Reddit()
const WhatsAppUser = require('../utils/user/whatsapp')
const WhatsApp = require('../utils/messenger/whatsapp')
const messengerWhatsApp = new WhatsApp()

const minimalArktoshiValue = parseInt(process.env.MIN_ARKTOSHI_VALUE, 10)
const ArkToshis = 100000000
const ARK = 'Ѧ'

class Send {
  constructor (sender, receiver, arktoshis, mainnet, platform, receiverPlatform) {
    this.arktoshis = parseInt(arktoshis, 10)
    this.mainnet = mainnet
    this.platform = platform
    this.receiverPlatform = typeof (receiverPlatform) !== 'undefined' ? receiverPlatform : platform

    switch (this.platform) {
      case 'reddit':
      default:
        this.sender = new RedditUser(sender)
        break
      case 'whatsapp':
        this.sender = new WhatsAppUser(sender)
        break
    }

    switch (this.receiverPlatform) {
      case 'reddit':
      default:
        this.receiver = new RedditUser(receiver)
        break
      case 'whatsapp':
        this.receiver = new WhatsAppUser(receiver)
        break
    }

    logger.error(`VARIABLES SEND: ${sender} ${receiver} ${arktoshis} ${platform} ${this.receiverPlatform} `)
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
    }
    return false
  }

  async __sendReddit (receiver, message, subject, platform) {
    try {
      message = message + messages.footer(platform)
      await messengerReddit.sendMessage(receiver, message, subject)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

  async __sendWhatsApp (receiver, message) {
    try {
      logger.error(`_SENDWHATSAPP: ${receiver} :: ${message}`)
      await messengerWhatsApp.sendMessage(receiver, message)
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
  async __senderHasBalance () {
    if (process.env.NODE_ENV === 'test' && this.arktoshis <= 90000000000) {
      return true
    }

    const balance = parseInt(await this.sender.getBalance(this.mainnet), 10)
    const fee = parseInt(await this.mainnet.getFee(), 10)

    if (!Number.isSafeInteger(balance) || !Number.isSafeInteger(fee)) {
      throw new RangeError('Bad input checking balance and fee.')
    }

    if (balance === 0 || balance + fee < this.arktoshis) {
      const address = await this.sender.getAddress()
      const amount = this.__formatBalance(this.arktoshis)
      const formattedBalance = this.__formatBalance(this.balance)
      const message = messages.notEnoughBalanceMessage(amount, formattedBalance, address, this.platform)
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
      throw new Error((`${this.sender.username} has insufficient balance for this transaction.`))
    }
    logger.info(`${this.sender.username} has sufficient balance for this transaction.`)
    return true
  }

 /**
  * @dev Test if the intended transaction is large enough
  * @returns true if it is
  **/
  __amountLargerThanMinimum () {
    return (this.arktoshis >= minimalArktoshiValue)
  }

 /**
  * @dev Test if we are not trying to send to ourself
  * @returns false or throws error
  **/
  __testSendToSelf () {
    if (this.sender.username === this.receiver.username) {
      throw new Error(`${this.sender.username} is trying to send to self.`)
    }
    return false
  }

 /**
  * @dev Create and post the transaction to the network
  * @returns transactionId or null
  **/
  async __sendTransaction () {
    try {
      const passphrase = await this.sender.getSeed()
      const recepient = await this.receiver.getAddress()
      const amount = this.arktoshis
      const transactionId = await this.mainnet.send(passphrase, recepient, amount)
      return transactionId
    } catch (error) {
      logger.error(error.message)
      return null
    }
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
    switch (this.receiverPlatform) {
      case 'reddit':
      default:
        const subject = 'You\'ve got Ark!'
        await this.__sendReddit(this.receiver.username, transactionReceiveMessage, subject, this.receiverPlatform)
        break
      case 'whatsapp':
        await this.__sendWhatsApp(this.receiver.username, transactionReceiveMessage)
        break
    }
  }

  /**
  * @dev  Format inputted balance to a string
  * @param {integer} amount The amount in Arktoshi
  * @returns  String with amount
  **/
  __formatBalance (amount) {
    amount = parseInt(amount, 10)

    if (!Number.isSafeInteger(amount)) {
      amount = 0
    }

    const balance = parseFloat(amount / ArkToshis)
    return `${ARK}${balance}`
  }
}

module.exports = Send
