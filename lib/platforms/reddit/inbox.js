'use strict'
require('dotenv').config()
const mainnet = require('../../utils/mainnet.js')
const Command = require('../../utils/command')
const logger = require('../../services/logger')
const database = require('../../services/database')
const redditConfig = require('./reddit')
const messages = require('../../config/messages')

const manager = process.env.REDDIT_MANAGER
const waitTime = 5000

class Inbox {
  constructor () {
    const isoNow = new Date().toISOString()
    const botStarted = messages.botStarted(isoNow)

    this.started = Date.now()
    this.mainnet = mainnet
    this._notifyManager(manager, botStarted)
  }

 /**
  * @dev  Initialize the Bot and start looping
  **/
  async initReddit () {
    try {
      await this.mainnet.initMainNet()
    } catch (error) {
      logger.error(error)
      return
    }

    while (true) { // Prevent chaining of Promises that gobble up memory
      try {
        await this.redditLoop()

        // const now = Date.now()
        // if (now > this.started + peerDiscoveryTime) {
          // this.started = now
          // this.mainnet.network.findAvailablePeers()
        // }
      } catch (error) {
        logger.error(error)
      }

      await this._sleep(waitTime)
    }
  }

 /**
  * @dev  Run the bot
  **/
  async redditLoop () {
    try {
      const inbox = await this._getUnreads()
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
      if (typeof item === 'undefined' || item === null || !item.hasOwnProperty('author') || !item.author.hasOwnProperty('name')) {
        throw new Error(`Bad Item: ${JSON.stringify(item)}`)
      }
      const sender = item.author.name
      const body = item.body ? item.body : ''
      const isComment = item.was_comment ? item.was_comment : false
      const id = item.id ? item.id : null
      const parentID = item.parent_id ? item.parent_id : null

      const submissionOk = await this._checkSubmission(id)
      if (!submissionOk) {
        return false
      }

      let receiver = null
      if (isComment) {
        await this.markCommentRead(id)
        const parentAuthor = await redditConfig.getComment(parentID).author
        if (!parentAuthor || !parentAuthor.hasOwnProperty('name') || parentAuthor.name === '[deleted]') {
          throw new Error('Parent comment has been deleted.')
        }
        receiver = parentAuthor.name
      } else {
        await this.markMessageRead(id)
      }

      logger.info(`Processing new submission ${id} from ${sender}`)
      const command = new Command(sender, receiver, this.mainnet, id, parentID)
      await command.execute(body, isComment)
      return true
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async markCommentRead (id) {
    try {
      const comment = await redditConfig.getComment(id)
      await redditConfig.markMessagesAsRead([comment])
    } catch (error) {
      logger.error(error)
    }
  }

  async markMessageRead (id) {
    try {
      const privateMessage = await redditConfig.getMessage(id)
      await privateMessage.markAsRead()
    } catch (error) {
      logger.error(error)
    }
  }

 /**
  * @dev  Checks if the bot has already seen this submission, and if not will mark it as seen and add it to the database
  * @param {string} id The submission id of the item to check
  * @returns  false if the submission was processed already, the database object if it wasn't
  **/
  async _checkSubmission (id) {
    try {
      const result = await database.query('SELECT * FROM submissions WHERE submission = $1 LIMIT 1', [id])
      const submission = result.rows[0]

      if (typeof submission !== 'undefined') {
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
      unreads = this.createInbox(unreads)

      return unreads
    } catch (error) {
      logger.error(error)
      return []
    }
  }

  createInbox (unreads) {
    const inbox = []

    for (let item in unreads) {
      if (unreads[item] && unreads[item].author) {
        inbox.push(unreads[item])
      }
    }

    return inbox.reverse()
  }

 /**
  * @dev  Wait for <ms> miliseconds
  * @param {integer} ms miliseconds
  **/
  async _sleep (ms) {
    await new Promise(resolve => setTimeout(resolve, ms))
  }

 /**
  * @dev  Send a notification message to the manager of the bot
  * @param {string} username The username of the manager
  * @param {string} message Message text to be send.
  **/
  async _notifyManager (username, message) {
    logger.info(`ArkTippr started - ${message}`)
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

module.exports = new Inbox()
module.exports.logger = logger
