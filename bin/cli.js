'use strict'
require('dotenv').config()
const BigNumber = require('bignumber.js')
const database = require('../lib/services/database')
const logger = require('../lib/services/logger')
const Transaction = require('../lib/utils/transactions')
const transactionBuilder = new Transaction()

const ARKTOSHI = Math.pow(10, 8)
const ARKTIPPR_SEED = process.env.ARKTIPPR_SEED ? process.env.ARKTIPPR_SEED : ''
const FEE = process.env.FEE ? new BigNumber(process.env.FEE).times(ARKTOSHI) : new BigNumber(0.000002).times(ARKTOSHI)
const VOTE_FEE = process.env.FEE ? new BigNumber(process.env.VOTE_FEE).times(ARKTOSHI) : new BigNumber(0.00000157).times(ARKTOSHI)
const FILL_AMOUNT = process.env.FILL_AMOUNT ? parseInt(process.env.FILL_AMOUNT, 10) : 20000
const FILL_VENDORFIELD = process.env.FILL_VENDORFIELD ? process.env.FILL_VENDORFIELD : ''

async function fill() {
  
  // Retrieve all addresses from the DB
  let result = await database.query('SELECT address FROM users')
  logger.info(`Users found: ${result.rows.length}`)
  
  // Send every account 0.00000200 ARK
  for (let item in result.rows) {
    const recepient = result.rows[item].address
    logger.info(`Address found: ${recepient}`)
    const transaction =  transactionBuilder.createTransaction(FILL_AMOUNT, recepient, FILL_VENDORFIELD, ARKTIPPR_SEED)
    
    console.log(JSON.stringify(transaction))
  }
  
}

async function vote() {
  // Retrieve all usernames from the DB
  
  // check if it has a vote already
  
  // cast vote
  
}

fill()