'use strict'

const logger = require('./logger')
const Snoowrap = require('snoowrap')
const Snoostorm = require('snoostorm')

require('dotenv').config()

const redditConfig = new Snoowrap({
    userAgent: 'ArkTippr',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
})

class Reddit {
  initReddit () {
    const client = new Snoostorm(redditConfig)

    const streamOpts = {
      subreddit: 'all',
      results: 25
    }

    const comments = client.CommentStream(streamOpts)

    comments.on('comment', (comment) => {
      logger.info(comment.body)
    })
  }
}

module.exports = new Reddit()
module.exports.logger = logger
