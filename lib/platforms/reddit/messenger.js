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
    .catch(error => {
      logger.error(error)
      throw new Error('Could not send message.')
    })
  }
  
  async postCommentReply(submissionID, reply) {
    try {
      if (typeof (submissionID) === 'undefined') {
        throw new Error('submissionID undefined')
      }
      const submission = await redditConfig.getComment(submissionID)
      await submission.reply(reply)
      
    } catch (error) {
      logger.error(error)
      throw new Error('Could not post comment reply.')
    }
  }
}

module.exports = RedditMessenger
