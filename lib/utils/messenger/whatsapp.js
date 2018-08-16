'use strict'
const Messenger = require('./messenger')
const logger = require('../../services/logger')
const Joi = require('joi')
const validateWhatsApp = Joi.extend(require('joi-phone-number'))

require('dotenv').config()
const SID = process.env.TWILIO_ACCOUNT_SID
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const PHONENUMBER = process.env.TWILIO_PHONENUMBER

class WhatsAppMessenger extends Messenger {
  async isValidReceiver (receiver) {
    const validated = await validateWhatsApp.string().phoneNumber({format: 'e164'}).validate(receiver)
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })

    return validated
  }

  async sendMessage (receiver, body) {
    if (process.env.NODE_ENV === 'test') {
      return true
    }

    const receiverOk = await this.isValidReceiver(receiver)
    if (!receiverOk) {
      throw new Error(`Bad WhatsApp receiver: ${JSON.stringify(receiver)}`)
    }

    const from = `whatsapp:${PHONENUMBER}`
    const to = `whatsapp:${receiver}`
    const client = require('twilio')(SID, AUTH_TOKEN)

    try {
      const message = await client.messages.create({
        body,
        from,
        to
      })
      logger.info(`Message sent: ${message.sid} to ${to}`)
      return true
    } catch (error) {
      logger.error(error)
      return false
    }
  }
}

module.exports = WhatsAppMessenger
