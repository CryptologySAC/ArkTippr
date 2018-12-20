'use strict'
const logger = require('../../services/logger')
const redditConfig = require('./reddit.js')
const Messenger = require('../messenger')

class RedditMessenger extends Messenger {

  async sendMessage (to, text, subject) {
    return redditConfig.composeMessage({
      to,
      subject,
      text
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
