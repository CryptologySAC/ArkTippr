'use strict'

const User = require('../utils/user')
const logger = require('../services/logger')
const coinmarketcap = require('../services/coinmarketcap')

class Balance {
  constructor (username, mainnet) {
    this.user = new User(username)
    this.mainnet = mainnet
  }

  async sendBalance () {
    try {
      let balance = await this.user.getBalance(this.mainnet)
      let usdValue

      if (balance !== null) {
        usdValue = await coinmarketcap.arkToshiToUSD(balance)
        balance = this.mainnet.formatBalance(balance)
      }

      return await this.user.sendBalanceReply(balance, usdValue)
    } catch (error) {
      logger.error(error)
      return null
    }
  }
}

module.exports = Balance
