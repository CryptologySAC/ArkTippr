'use strict'

const logger = require('./logger')
const Snoowrap = require('snoowrap')
const Command = require('../utils/command')
const database = require('../services/database')
const mainnet = require('../utils/mainnet.js')
const messages = require('../config/messages')

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

const manager = process.env.REDDIT_MANAGER
const waitTime = 5000
const peerDiscoveryTime = 900000 // 15 Min

class Reddit {
  constructor () {
    this.started = Date.now()

    logger.info('ArkTippr started')
  }

 /**
  * @dev  Initialize the Bot
  **/
  async initReddit () {
    await this._notifyManager(manager, messages.botStarted())

    this.mainnet = mainnet
    await this.mainnet.initMainNet()

    while (true) { // Prevent chaining of Promises that gobble up memory
      await this.redditLoop()

      let now = Date.now()
      if (now > this.started + peerDiscoveryTime) {
        this.started = now
        this.mainnet.network.findAvailablePeers()
      }

      await this._sleep(waitTime)
    }
  }

 /**
  * @dev  Run the bot
  **/
  async redditLoop () {
    try {
      let inbox = await this._getUnreads()
      for (let item in inbox) {
        await this._processInboxItem(inbox[item])
      }
    } catch (error) {
      logger.error(error)
    }
  }

 /**
  * @dev  Process an item (message, mention) from the Bot's Inbox
  * @param {object} item The message or mention to process
  **/
  async _processInboxItem (item) {
    try {
  
      const sender = item.author.name
      const body = item.body
      const isComment = item.was_comment
      const id = item.id
      const parentID = item.parent_id ? item.parent_id : null

      const submissionOk = await this._checkSubmission(id)
      if (!submissionOk) {
        return false
      }
      
      logger.warn(`TESTING comments to post: ${JSON.stringify(item.author)}`)

      let receiver = null
      if (isComment) {
        receiver = await redditConfig.getComment(parentID).author.name
      } else {
        const privateMessage = await redditConfig.getMessage(id)
        privateMessage.markAsRead()
      }

      logger.info(`Processing new submission ${id} from ${sender}`)
      const command = new Command(sender, receiver, this.mainnet, id, parentID)
      await command.execute(body, isComment) // MENTION OR COMMAND
      return true
    } catch (error) {
      logger.error(error)
    }

    return false
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
        return false
      }

      const sql = 'INSERT INTO submissions(submission) VALUES($1) RETURNING *'
      const values = [id]

      await database.query(sql, values)
      logger.info(`New submission ${id} has been added to the database.`)
      return true
    } catch (error) {
      logger.error(error)
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
      logger.error(error)
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

 /**
  * @dev  Send a notification message to the manager of the bot
  * @param {string} username The username of the manager
  * @param {string} message Message text to be send.
  **/
  async _notifyManager (username, message) {
    redditConfig.composeMessage({
      to: username,
      subject: 'Ark Tipbot u/arktippr started',
      text: message
    })
    .then(() => {
      logger.info(`Ark Tipbot message START to ${username} sent.`)
      return true
    })
    .catch(error => {
      logger.error(error)
      return false
    })
  }
}

module.exports = new Reddit()
module.exports.logger = logger
