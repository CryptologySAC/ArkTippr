'use strict'
require('dotenv').config()
const Snoowrap = require('snoowrap')

const userAgent = 'ArkTippr'
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const username = process.env.REDDIT_USER
const password = process.env.REDDIT_PASS
const requestDelay = 100
const continueAfterRatelimitError = true

const redditConfig = new Snoowrap({
  userAgent,
  clientId,
  clientSecret,
  username,
  password
})

const config = {
  requestDelay,
  continueAfterRatelimitError
}
redditConfig.config(config)

module.exports = redditConfig
