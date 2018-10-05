'use strict'

const network = require('../../lib/services/network')
const net = 'mainnet'
const ArkToshis = 100000000

class Mainnet {
  constructor () {
    this.noBalance = false
    this.unconfirmedBalance = '9'
  }

  async initNetwork () {
    network.logger.info = () => { }
    network.logger.warn = () => { }
    network.logger.error = () => { }

    this.network = network
    await this.network.setNetwork(net)
  }

  setBadsender (status) {
    this.nobalance = status
  }

  setUnconfirmedBalance (balance) {
    this.unconfirmedBalance = balance.toString()
  }

  async getBalance () {
    const balance = this.nobalance ? '0' : '5'
    return { confirmedBalance: balance, unConfirmedBalance: this.unconfirmedBalance }
  }

  formatBalance (amount) {
    amount = parseInt(amount, 10)

    if (!Number.isSafeInteger(amount)) {
      amount = 0
    }

    const balance = amount / ArkToshis;
    const symbol = 'Ѧ0'
    return `${symbol}${balance}`
  }

  async getFee () {
    return 10000000
  }

  async send () {
    return '1234567890'
  }
}

module.exports = new Mainnet()
