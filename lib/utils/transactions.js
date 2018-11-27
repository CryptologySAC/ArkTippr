'use strict'
require('dotenv').config()
const arkecosystem = require('@arkecosystem/crypto')
const transactionBuilder = arkecosystem.transactionBuilder
const BigNumber = require('bignumber.js')
BigNumber.config({ROUNDING_MODE: BigNumber.ROUND_DOWN})

const ARKTOSHI = Math.pow(10, 8)
const FEE = process.env.FEE ? new BigNumber(process.env.FEE).times(ARKTOSHI) : new BigNumber(0.1).times(ARKTOSHI)

class Transactions {
  
  createTransaction (amount, recipientId, vendorField, passphrase, secondPassphrase = null) {
    let transaction = transactionBuilder
      .transfer()
      .amount(amount)
      .recipientId(recipientId)
      .vendorField(vendorField)
      .fee(10000000)
      .sign(passphrase)

    if (secondPassphrase !== null) {
      transaction = transaction.secondSign(secondPassphrase)
    }

    transaction = transaction.getStruct()
    return transaction
  }
}

module.exports = Transactions
