'use strict'
require('dotenv').config()
const BigNumber = require('bignumber.js')
const database = require('../lib/services/database')
const logger = require('../lib/services/logger')
const network = require('../lib/services/network')
const Transaction = require('../lib/utils/transactions')
const transactionBuilder = new Transaction()

const ARKTOSHI = Math.pow(10, 8)
const ARKTIPPR_SEED = process.env.ARKTIPPR_SEED ? process.env.ARKTIPPR_SEED : ''
const VOTE_FEE = process.env.FEE ? new BigNumber(process.env.VOTE_FEE).times(ARKTOSHI) : new BigNumber(0.00000157).times(ARKTOSHI)
const FILL_AMOUNT = process.env.FILL_AMOUNT ? parseInt(process.env.FILL_AMOUNT, 10) : 20000
const FILL_VENDORFIELD = process.env.FILL_VENDORFIELD ? process.env.FILL_VENDORFIELD : ''

async function fill() {
  
  // Retrieve all addresses from the DB
  let result = await database.query('SELECT address FROM users')
  logger.info(`Users found: ${result.rows.length}`)
  
  // Send every account 0.00000200 ARK
  const transactions = []
  for (let item in result.rows) {
    const recepient = result.rows[item].address
    const transaction =  transactionBuilder.createTransaction(FILL_AMOUNT, recepient, FILL_VENDORFIELD, ARKTIPPR_SEED)
    transactions.push(transaction)
  }
  
  const maxTx = 40
  for (let i = 0; i < transactions.length; i += maxTx) {
    const transactionsChunk = transactions.slice(i, i + maxTx)
    const results1 = await network.postTransaction(transactionsChunk)
    const results2 = await network.broadcast(transactionsChunk)
    
    try{
      logger.info(`Server 1: ${JSON.stringify(results1.data)}`)
      logger.info(`Server 2: ${JSON.stringify(results2.data)}`)
    } catch (error) {
      
    }
  }
}

async function vote() {
  // Retrieve all usernames from the DB
  let result = await database.query('SELECT seed FROM users')
  logger.info(`Users found: ${result.rows.length}`)
  
  // cast vote
  const transactions = []
  for (let item in result.rows) {
    const seed = result.rows[item].seed
    
    console.log(seed)
    
  }
  
}

//fill()
vote()