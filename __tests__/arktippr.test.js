'use strict'

/* USE THIS FILE TO TRY OUT ANYTHING WHEN BUG FIXING */

/*
const Snoowrap = require('snoowrap')
const logger = require('../lib/services/logger')
require('dotenv').config()

const redditConfig = new Snoowrap({
    userAgent: 'ArkTippr',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
})

const config = {
  requestDelay: 2500,
  continueAfterRatelimitError: true
}
redditConfig.config(config)

describe('unreads', () => {
  const options = {
    filter: 'unread'
  }
  it('should do stuff', async () => {
    let unreads = await redditConfig.getInbox(options)
      .then(results => {
        // convert the Promise to a valid array
        const _unreads = []
        results.forEach(item => {
          _unreads.push(item)
        })
        return _unreads
      })
    expect(unreads).toBe('s')
  })

  it('should mark comment as read', async () => {
    let comment = 'e38abxh'
    let result = await redditConfig.getComment(comment)
    let markread = await redditConfig.markMessagesAsRead([result])
    let resultAfter = await redditConfig.getComment(comment)
    logger.warn(JSON.stringify(result))
    logger.warn(JSON.stringify(markread))
    logger.warn(JSON.stringify(resultAfter))
    expect(resultAfter).toBe('d')
  })

  it('should mark post as read', async () => {
    let comment = '92a7xp'
    let result = await redditConfig.getComment(comment)
    let markread = await redditConfig.markMessagesAsRead([result])
    let resultAfter = await redditConfig.getComment(comment)
    logger.warn(JSON.stringify(result))
    logger.warn(JSON.stringify(markread))
    logger.warn(JSON.stringify(resultAfter))
    expect(resultAfter).toBe('d')
  })
})

describe('name.author gone wrong', () => {
  it('should give back good results for post', async () => {
    let goodComment = '92a7xp'
    let goodReceiver = await redditConfig.getSubmission(goodComment).author.name
    expect(goodReceiver).toBe('s')
  })

  it('should give back bad results for post', async () => {
    let goodComment = '92a7xp'
    let goodReceiver = await redditConfig.getComment(goodComment).author.name
    expect(goodReceiver).toBe('s')
  })

  it('should give back bad results for comment', async () => {
    let goodComment = 'e348uh9'
    let goodReceiver = await redditConfig.getSubmission(goodComment).author.name
    expect(goodReceiver).toBe('s')
  })

  it('should give back good results for comment', async () => {
    let goodComment = 'e348uh9'
    let goodReceiver = await redditConfig.getComment(goodComment).author// .name
    expect(goodReceiver.name).toBe('s')
  })

  it('should give back bad results', async () => {
    const badComment = 't1_e387sfh'
    let badReceiver = await redditConfig.getComment(badComment).author// .name
    if (!badReceiver || !badReceiver.hasOwnProperty('name') || badReceiver.name === '[deleted]') {
      expect(badReceiver.name).toBe('Q')
    }
    expect(badReceiver.name).toBe('s')
  })
})
*/
