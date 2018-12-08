'use strict'
require('dotenv').config()
const BigNumber = require('bignumber.js')
const database = require('../lib/services/database')
const logger = require('../lib/services/logger')

const ARKTOSHI = Math.pow(10, 8)
const ARKTIPPR_SEED = process.env.ARKTIPPR_SEED ? process.env.ARKTIPPR_SEED : ''
const FEE = process.env.FEE ? new BigNumber(process.env.FEE).times(ARKTOSHI) : new BigNumber(0.000002).times(ARKTOSHI)
const VOTE_FEE = process.env.FEE ? new BigNumber(process.env.VOTE_FEE).times(ARKTOSHI) : new BigNumber(0.00000157).times(ARKTOSHI)

async function fill() {
  // Retrieve all addresses from the DB
  let result = await database.query('SELECT address FROM users')
  logger.info(`Users found: ${result.rows.length}`)
  
  // Send every account 0.00000200 ARK
  for (let item in result.rows) {
    logger.info(`Address found: ${result.rows[item]}`)
  }
  
}

async function vote() {
  // Retrieve all usernames from the DB
  
  // check if it has a vote already
  
  // cast vote
  
}

fill()