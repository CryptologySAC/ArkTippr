'use strict'

const logger = require('./logger')
const Snoowrap = require('snoowrap')
const Command = require('../utils/command')
const database = require('../services/database')

require('dotenv').config()

const redditConfig = new Snoowrap({
    userAgent: 'ArkTippr',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
})

class Reddit {
  async initReddit (mainnet) {
    this.mainnet = mainnet
    await this.redditLoop()
  }

  async redditLoop () {
    try {
      let inbox = await this._getUnreads()
      logger.info(`${inbox.length} new unreads received.`)
      for (let item in inbox) {
        await this._processInboxItem(inbox[item])
      }
    } catch (error) {
      logger.error(`Reddit.redditLoop(): ${error.message}`)
    }

    // await this._sleep(2000)
     // await this.redditLoop()
  }

  async _processInboxItem (item) {
    const sender = item.author.name
    const body = item.body
    const isComment = item.was_comment
    const id = item.id
    const parentID = item.parent_id ? item.parent_id : null

    const submissionOk = await this._checkSubmission(id)
    if (!submissionOk) {
      logger.warn(`Submission ${id} has already been processed.`)
      return
    }

    let receiver = null
    if (isComment) {
      receiver = await redditConfig.getComment(parentID).author.name
    }
    const command = new Command(sender, receiver, this.mainnet, id, parentID)
    await command.parseBody(body)
    console.log(`sender: ${command.sender}; body: ${body}; receiver: ${command.receiver}; ID: ${id}; name: ${item.name} ${JSON.stringify(item)}`)
  }

  async _checkSubmission (id) {
    const result = await database.query('SELECT * FROM submissions WHERE submission = $1 LIMIT 1', [id])
    let submission = result.rows[0]

    if (typeof (submission) === 'undefined') {
      const sql = 'INSERT INTO submissions(submission) VALUES($1) RETURNING *'
      const values = [id]

      try {
        const res = await database.query(sql, values)
        logger.info(`Submission ${id} has been added to the database.`)
        return res
      } catch (error) {
        logger.error(error.message)
        return false
      }
    }

    return false
  }

  async _getUnreads () {
    const options = {
      filter: 'unread'
    }

    try {
      let unreads = await redditConfig.getInbox(options)
      .then(results => {
        // convert the Promise to a valid array
        const _unreads = []
        results.forEach(item => {
          _unreads.push(item)
        })
        return _unreads
      })

      // Put oldest unreads first
      unreads = unreads.reverse()

      return unreads
    } catch (error) {
      logger.error(`Reddit._getMentions(): ${error.message}`)
      return []
    }
  }

  async _sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new Reddit()
module.exports.logger = logger
