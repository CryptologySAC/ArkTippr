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
    await this.network.setNetwork(net)
  }

  async getBalance (arkAddress) {
    const balance = arkAddress === 'testAddress' ? 'Ѧ 100' : 'Ѧ 0'
    return balance
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
}

module.exports = new Mainnet()
