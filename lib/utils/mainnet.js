'use strict'

require('dotenv').config()
const Joi = require('joi')
const network = require('../services/network')
const logger = require('../services/logger')
const Transaction = require('./transactions')
const BigNumber = require('bignumber.js')
BigNumber.config({ROUNDING_MODE: BigNumber.ROUND_DOWN})

const ARKTOSHI = Math.pow(10, 8)
const FEE = process.env.FEE ? new BigNumber(process.env.FEE).times(ARKTOSHI) : new BigNumber(0.1).times(ARKTOSHI)

const schema = {
  address: Joi.string().length(34).required()
}

// const ArkToshis = 100000000
// const node = process.env.ARK_NODE
const SMARTBRIDGE = 'ArkTippr: The Ark Tipbot.'

class Mainnet {
  constructor () {
    this.network = network
    this.net = 'mainnet'
    this.transactionBuilder = new Transaction()
  }

 /**
  * @dev Initialize the Ark mainnet and connect to it
  **/
  async initMainNet () {
    // try {
      // await this.network.setNetwork(this.net)
      // await this.network.setServer(node)
      // const response = await this.network.getFromNode('/api/loader/autoconfigure')
      // this.network.network.config = response.data.network
      // await this.network.connect(this.net)
      // await this.network.findAvailablePeers()
      this.symbol = 'Ѧ'

      // logger.info(`Connection to ${this.net} @node ${node} initialized.`)
    // } catch (error) {
      // logger.error(error)
    // }
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

      const response = await network.getFromNode(`wallets/${arkAddress}`)
      if (!response.data.hasOwnProperty('data') || !response.data.data.hasOwnProperty('balance')) {
        throw new Error('Failed to retrieve wallet status from node.')
      }

      const confirmedBalance = response.data.data.balance

      return confirmedBalance
    } catch (error) {
      return 0
    }
  }

  async getVoted (arkAddress) {
    try {
      Joi.validate({ address: arkAddress }, schema, (err) => {
        if (err) {
          throw new Error('Please enter a valid formatted address.')
        }
      })

      const response = await network.getFromNode(`wallets/${arkAddress}/votes`)
      if (!response.data.hasOwnProperty('data')) {
        throw new Error('Failed to retrieve vote status from node.')
      }

      const voted = response.data.data.length > 0

      return voted
    } catch (error) {
      return false
    }
  }

  async getVoters () {
    let voters = []
    let page = 1
    let pageCount = 1
    while (page <= pageCount) {
      const response = await network.getFromNode(`delegates/cryptology/voters?page=${page}`)
      if (response.data.hasOwnProperty('meta') && response.data.meta.hasOwnProperty('pageCount')) {
        pageCount = parseInt(response.data.meta.pageCount, 10)
      }
      for (let item in response.data.data) {
        voters.push(response.data.data[item].address)
      }
      page++
    }
    return voters
  }

 /**
  * @dev Return the network send fee
  * @returns send fee
  **/
  async getFee () {
    return parseInt(FEE.toFixed(0), 10)
  }

 /**
  * @dev  Format inputted balance to a string
  * @param {integer} amount The amount in Arktoshi
  * @returns  String with amount
  **/
  formatBalance (amount) {
    amount = new BigNumber(amount)

    const balance = amount.div(ARKTOSHI).toFixed(8)
    const symbol = typeof this.symbol !== 'undefined' ? `${this.symbol}` : ''
    return `${symbol}${balance}`
  }

 /**
  * @dev  Send amount from sender to receiver on the Ark blockchain
  * @param {string} passphrase Sender private key seed
  * @param {string} recepient Receiver address
  * @param {integer} amount Amount in Arktoshis
  * @returns  transactionId or null
  **/
  async send (passphrase, recepient, amount, vendorField = SMARTBRIDGE) {
    const secondSecret = null
    try {
      const transactions = [] // for future usage
      const transaction = this.transactionBuilder.createTransaction(amount, recepient, vendorField, passphrase, secondSecret)
      transactions.push(transaction)

      const transactionResponse = await network.postTransaction(transactions)
      if (!transactionResponse.data.hasOwnProperty('data')) {
        throw new Error('Failed to post transaction to the network.')
      }

      if (transactionResponse.data.data.hasOwnProperty('accept') && transactionResponse.data.data.accept.length) {
        const transactionId = transactionResponse.data.data.accept[0]
        await network.broadcast(transactions)
        logger.info(`Transaction ${transactionId} broadcasted to the blockchain.`)
        return transactionId
      }

      throw new Error(`Transaction invalid: ${JSON.stringify(transactionResponse.data.data)}`)
    } catch (error) {
      logger.error(error)
      return null
    }
  }
}

module.exports = new Mainnet()
