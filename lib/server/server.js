
const express = require('express')
const bodyParser = require('body-parser')
const twilio = require('twilio')
const logger = require('../services/logger')
const ArkTwilio = require('../utils/twilio')

const api = express.Router()
const shouldValidate = false

api.route('/message')
  .post([bodyParser.json(), twilio.webhook({ validate: shouldValidate })], async (req, res) => {
    try {
      const params = req.body
      const from = req.body.From
      const message = req.body.Body
      const id = req.body.MessageSid

      const arkTwilio = new ArkTwilio(from, message, id, params)
      await arkTwilio.processMessage()
    } catch (error) {
      logger.error(error)
    }
    res.writeHead(200, {'Content-Type': 'text/xml'})
    res.end()
  })

api.route('/status')
  .post(bodyParser.json(), async (req, res) => {
    try {
      res.writeHead(200, {'Content-Type': 'text/xml'})
      res.end()

      logger.info(`STATUS: ${JSON.stringify(req.body)}`)
    } catch (error) {
      logger.error(error)
    }
  })

api.route('/errors')
  .post(bodyParser.json(), async (req, res) => {
    try {
      res.writeHead(200, {'Content-Type': 'text/xml'})
      res.end()
      logger.info(`ERRORS: ${JSON.stringify(req.body)}`)
    } catch (error) {
      logger.error(error)
    }
  })

module.exports = {
  api
}
