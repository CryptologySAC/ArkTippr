'use strict'
const logger = require('../../services/logger')
const redditConfig = require('./reddit.js')
const Messenger = require('../messenger')

class RedditMessenger extends Messenger {

  async sendMessage (message, subject) {
    return redditConfig.composeMessage({
      to: this.username,
      subject,
      text: message
    })
    .then(() => {
      return true
    })
    .catch(error => {
      logger.error(error)
      return false
    })
  }
}

module.exports = RedditMessenger
