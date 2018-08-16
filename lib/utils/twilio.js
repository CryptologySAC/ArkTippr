'use strict'
require('dotenv').config()
const logger = require('../services/logger')
const Command = require('./command')
const mainnet = require('./mainnet')

const PLATFORM = 'reddit'

class ArkTwilio {
  constructor (from, body, id, params) {
    this.sender = this.getUsername(from)
    this.body = body
    this.id = id
    this.params = params
    this.mainnet = mainnet
  }

  async processMessage () {
    try {
      await this.mainnet.initMainNet()

      logger.info(`Processing new submission ${this.id} from ${this.sender}`)
      const command = new Command(this.sender, null, PLATFORM, this.mainnet, this.id)
      await command.execute(this.body)
      
      return true
    } catch (error) {
      logger.error(error)
      return false
    }
  }
  
  getUsername(from) {
    const nameParts = from.split(':')
    const username = nameParts[1]
    return username
  }
}

module.exports = ArkTwilio
