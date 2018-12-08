'use strict'
require('dotenv').config()
const arkecosystem = require('@arkecosystem/crypto')
const transactionBuilder = arkecosystem.transactionBuilder
const BigNumber = require('bignumber.js')
BigNumber.config({ROUNDING_MODE: BigNumber.ROUND_DOWN})

const ARKTOSHI = Math.pow(10, 8)
const CRYPTOLOGY = '03364c62f7c5a7948dcaacdc72bac595e8f6e79944e722d05c8346d68aa1331b4a'
const FEE = process.env.FEE ? new BigNumber(process.env.FEE).times(ARKTOSHI) : new BigNumber(0.1).times(ARKTOSHI)
const VOTE_FEE = process.env.FEE ? new BigNumber(process.env.VOTE_FEE).times(ARKTOSHI) : new BigNumber(0.00000157).times(ARKTOSHI)

class Transactions {
  createTransaction (amount, recipientId, vendorField, passphrase, secondPassphrase = null) {
    let transaction = transactionBuilder
      .transfer()
      .amount(amount)
      .recipientId(recipientId)
      .vendorField(vendorField)
      .fee(parseInt(FEE.toFixed(0), 10))
      .sign(passphrase)

    if (secondPassphrase !== null) {
      transaction = transaction.secondSign(secondPassphrase)
    }

    transaction = transaction.getStruct()
    return transaction
  }
  
  createVoteTransaction (recepient, passphrase) {
    const votes = []
    let vote = `+${CRYPTOLOGY}`
    votes.push(vote)

    let transaction = transactionBuilder
      .vote()
      .votesAsset(votes)
      .fee(parseInt(VOTE_FEE.toFixed(0), 10))
         
    transaction = transaction.network({pubKeyHash: 23})
    transaction = transaction.sign(passphrase)

    transaction = transaction.getStruct()
    console.log(JSON.stringify(transaction))
    return transaction
  }
}

module.exports = Transactions
