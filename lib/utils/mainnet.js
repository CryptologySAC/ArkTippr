'use strict'

const arkjs = require('arkjs')
const Joi = require('joi')
const network = require('../services/network')
const logger = require('../services/logger')

const schema = {
  address: Joi.string().length(34).required()
}

require('dotenv').config()
const ArkToshis = 100000000
const node = process.env.ARK_NODE
const smartbridge = 'ArkTippr: The Ark Tipbot.'

class Mainnet {
  constructor () {
    this.network = network
    this.net = 'mainnet'
  }

 /**
  * @dev Initialize the Ark mainnet and connect to it
  **/
  async initMainNet () {
    try {
      await this.network.setNetwork(this.net)
      await this.network.setServer(node)
      const response = await this.network.getFromNode('/api/loader/autoconfigure')
      this.network.network.config = response.data.network
      await this.network.connect(this.net)
      await this.network.findAvailablePeers()
      this.symbol = network.network.config.symbol

      logger.info(`Connection to ${this.net} @node ${node} initialized.`)
    } catch (error) {
      logger.error(error)
    }
  }

 /**
  * @dev Retreive the balance of an address from the network and return a formatted string.
  * @param {string} arkAddress The Ark wallet to get the balance of
  * @returns  {string} Formatted string with balance of the wallet
  **/
  async getBalance (arkAddress) {
    try {
      Joi.validate({ address: arkAddress }, schema, (err) => {
        if (err) {
          throw new Error('Please enter a valid formatted address.')
        }
      })

      const balance = await network.getFromNode(`/api/accounts?address=${arkAddress}`)
      if (!balance.data.hasOwnProperty('success') || !balance.data.success) {
        const errorMsg = balance.data.hasOwnProperty('error') && balance.data.error
            ? balance.data.error : 'Failed to retrieve wallet status from node.'
        throw new Error(errorMsg)
      }
      const confirmedBalance = balance.data.account.balance
      const unConfirmedBalance = balance.data.account.unconfirmedBalance

      return { confirmedBalance, unConfirmedBalance }
    } catch (error) {
      return { confirmedBalance: '0', unConfirmedBalance: '0' }
    }
  }

 /**
  * @dev Return the network send fee
  * @returns send fee
  **/
  async getFee () {
    if (this.fees && this.fees.send) {
      return this.fees.send // Change in V2
    }

    const fees = await network.getFromNode('/api/blocks/getFees')
    if (!fees.data.hasOwnProperty('success') || !fees.data.success) {
      const errorMsg = fees.data.hasOwnProperty('error') && fees.data.error
            ? fees.data.error : 'Failed to retrieve fees from network.'
      logger.error(errorMsg)
      return 10000000
    }
    this.fees = fees.data.fees >= 0 ? fees.data.fees : 10000000
    return this.fees
  }

 /**
  * @dev  Format inputted balance to a string
  * @param {integer} amount The amount in Arktoshi
  * @returns  String with amount
  **/
  formatBalance (amount) {
    amount = parseInt(amount, 10)

    if (!Number.isSafeInteger(amount)) {
      amount = 0
    }

    const balance = parseFloat(amount / ArkToshis)
    const symbol = typeof (this.symbol) !== 'undefined' ? `${this.symbol}` : ''
    return `${symbol}${balance}`
  }

 /**
  * @dev  Send amount from sender to receiver on the Ark blockchain
  * @param {string} passphrase Sender private key seed
  * @param {string} recepient Receiver address
  * @param {integer} amount Amount in Arktoshis
  * @returns  transactionId or null
  **/
  async send (passphrase, recepient, amount) {
    const secondSecret = null
    try {
      const transaction = arkjs.transaction.createTransaction(recepient, amount, smartbridge, passphrase, secondSecret)
      const transactionResponse = await network.postTransaction(transaction)
      if (!transactionResponse.data.hasOwnProperty('success') || !transactionResponse.data.success) {
        let errorMsg = transactionResponse.data.hasOwnProperty('error') && transactionResponse.data.error
          ? transactionResponse.data.error : 'Failed to post transaction to the network.'
        throw new Error(errorMsg)
      }

      if (transactionResponse.data.hasOwnProperty('transactionIds') && transactionResponse.data.transactionIds.length) {
        // Broadcast the transaction
        try {
          await network.broadcast(transaction)
        } catch (err) {
          // Do nothing, we are only bradcasting
        }

        const transactionId = transactionResponse.data.transactionIds[0]
        logger.info(`Transaction ${transactionId} broadcasted to the blockchain.`)
        return transactionId
      }
    } catch (error) {
      logger.error(error)
      return null
    }
  }
}

module.exports = new Mainnet()
