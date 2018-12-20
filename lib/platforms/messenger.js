'use strict'
const logger = require('../services/logger')

class Messenger {
  constructor () {

  }
  
  async sendMessage (message, subject) {
    logger.warn('No generic messenger available, use platform version.')
  }
}

module.exports = Messenger
