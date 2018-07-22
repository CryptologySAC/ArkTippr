'use strict'

const network = require('../../lib/services/network')
const net = 'mainnet'
const ArkToshis = 100000000

class Mainnet {
  async initNetwork () {
    network.logger.info = () => { }
    network.logger.warn = () => { }
    network.logger.error = () => { }

    this.network = network
    this.noBalance = false
    await this.network.setNetwork(net)
  }

  setBadsender (status) {
    this.nobalance = status
  }

  async getBalance (arkAddress) {
    const balance = this.nobalance ? '0' : '10000000000'
    return { confirmedBalance: balance, unConfirmedBalance: balance }
  }

  formatBalance (amount) {
    amount = parseInt(amount, 10)

    if (!Number.isSafeInteger(amount)) {
      amount = 0
    }

    const balance = amount / ArkToshis;
    const symbol = 'Ѧ 0'
    return `${symbol}${balance}`
  }

  async getFee () {
    return 10000000
  }
}

module.exports = new Mainnet()
