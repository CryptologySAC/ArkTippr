'use strict'

const User = require('../utils/user/user')
const logger = require('../services/logger')

class Vote {
  constructor (username) {
    this.user = new User(username)
  }

  async sendVote () {
    try {
      const address = await this.user.getAddress()

      return await this.user.sendVoteReply(address)
    } catch (error) {
      logger.error(error.message)
      return null
    }
  }
}

module.exports = Vote
