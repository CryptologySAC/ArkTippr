'use strict'
const logger = require('../services/logger')
const messages = require('./messages')
const coinmarketcap = require('../services/coinmarketcap')

const BigNumber = require('bignumber.js')
BigNumber.config({ROUNDING_MODE: BigNumber.ROUND_DOWN})

const ARKTOSHI = new BigNumber(Math.pow(10, 8))
const ARK = 'Ѧ'

class Messenger {
  constructor () {

  }
  
  async sendMessage () {
    logger.warn('No generic messenger available, use platform version.')
  }
  
  async postCommentReply() {
    logger.warn('No generic comment poster available, use platform version.')
  }
  
  async sendWithdrawMessage(transactionId, amount, recipientAddress, to) {
    try {
      amount = this.__formatBalance(amount)
      const subject = 'ArkTippr Withdrawal Success'
      const text = messages.transactionWithdrawMessage(amount, transactionId, recipientAddress) + messages.smallFooter()
     
      await this.sendMessage(to, text, subject) 
    } catch (error) {
      logger.error(error)
      throw new Error('Could not send Withdraw reply.')
    }
  }
  
  async sendDepositMessage (address, to) {
    try {
      const subject = 'Your ArkTippr wallet address'
      const text = messages.depositMessage(address) + messages.smallFooter()
      
      await this.sendMessage(to, text, subject) 
    } catch (error) {
      logger.error(error)
      throw new Error('Could not send Deposit message.')
    }
  }
  
  async sendBalanceMessage(balance, to) {
    try {
      let message = messages.noBalanceMessage()
      if (balance > 0) {
        const usdValue = await coinmarketcap.arkToshiToUSD(balance)
        balance = this.__formatBalance(balance)
        message = messages.balanceMessage(balance, usdValue)
      }   
      const subject = 'Your ArkTippr wallet balance'
      const text = message + messages.smallFooter()
     
      await this.sendMessage(to, text, subject) 
    } catch (error) {
      logger.error(error)
      throw new Error('Could not send Withdraw reply.')
    }
  }
  
  async sendHelpMessage (to) {
    try {
      const subject = 'ArkTippr Help'
      const text = messages.helpMessage() + messages.smallFooter()
      
      await this.sendMessage(to, text, subject) 
    } catch (error) {
      logger.error(error)
      throw new Error('Could not send Help message.')
    }
  }
  
  /**
  * @dev  Format inputted balance to a string
  * @param {integer} amount The amount in Arktoshi
  * @returns  String with amount
  **/
  __formatBalance (amount) {
    amount = new BigNumber(amount)

    const balance = amount.div(ARKTOSHI).toString()
    return `${ARK} ${balance}`
  }
}

module.exports = Messenger
