'use strict'
const Messenger = require('./messenger')
const logger = require('../../services/logger')
const redditConfig = require('../../services/reddit')

require('dotenv').config()

class RedditMessenger extends Messenger {
  async isValidReceiver (receiver) {
    try {
      const redditUser = await redditConfig.getUser(receiver).getTrophies()
      return redditUser && redditUser.hasOwnProperty('trophies')
    } catch (error) {
      return false
    }
  }

  async sendMessage (receiver, body, subject) {
    const receiverOk = await this.isValidReceiver(receiver)
    if (!receiverOk) {
      throw new Error(`Bad receiver: ${receiver}`)
    }

    const to = receiver
    return redditConfig.composeMessage({
      to,
      subject,
      text: body
    })
    .then(() => {
      logger.info(`Message sent to ${to}`)
      return true
    })
    .catch(error => {
      logger.error(error)
      return false
    })
  }
}

module.exports = RedditMessenger
