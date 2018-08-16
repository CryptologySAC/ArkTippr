require('dotenv').config()

const express = require('express')
const logger = require('../lib/services/logger')
const server = require('../lib/server/server')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.CONFIG_PORT

app.use(bodyParser.urlencoded({ extended: false }))
app.use('/api', server.api)
app.listen(port)
logger.info(`ArkTippr WhatsApp server started on port: ${port}`)
