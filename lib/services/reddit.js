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
 /**
  * @dev  Initialize the Bot
  * @param {object} mainnet Connection to the Ark mainnet
  **/
  async initReddit (mainnet) {
    this.mainnet = mainnet
    await this.redditLoop()
  }

 /**
  * @dev  Run the bot
  **/
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

    // TODO await this._sleep(2000)
    // TODO await this.redditLoop()
  }

 /**
  * @dev  Process an item (message, mention) from the Bot's Inbox
  * @param {object} item The message or mention to process
  **/
  async _processInboxItem (item) {
    const sender = item.author.name
    const body = item.body
    const isComment = item.was_comment
    const id = item.id
    const parentID = item.parent_id ? item.parent_id : null

    const submissionOk = await this._checkSubmission(id)
    if (!submissionOk) {
      return
    }

    let receiver = null
    if (isComment) {
      receiver = await redditConfig.getComment(parentID).author.name
    }

    logger.info(`Processing new submission ${id} from ${sender}`)
    const command = new Command(sender, receiver, this.mainnet, id, parentID)
    await command.parseBody(body)
  }

 /**
  * @dev  Checks if the bot has already seen this submission, and if not will mark it as seen and add it to the database
  * @param {string} id The submission id of the item to check
  * @returns  false if the submission was processed already, the database object if it wasn't
  **/
  async _checkSubmission (id) {
    try {
      const result = await database.query('SELECT * FROM submissions WHERE submission = $1 LIMIT 1', [id])
      let submission = result.rows[0]

      if (typeof (submission) !== 'undefined') {
        logger.warn(`Submission ${id} has already been processed.`)
        return false
      }

      const sql = 'INSERT INTO submissions(submission) VALUES($1) RETURNING *'
      const values = [id]

      await database.query(sql, values)
      logger.info(`Submission ${id} has been added to the database.`)
      return true
    } catch (error) {
      logger.error(error.message)
      return false
    }
  }

 /**
  * @dev  Retrieve all unread items (mentions en messages) from the Inbox
  * @returns  Array with all unread items
  **/
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

 /**
  * @dev  Wait for <ms> miliseconds
  * @param {integer} ms miliseconds
  * @returns Promise to wait
  **/
  async _sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new Reddit()
module.exports.logger = logger
