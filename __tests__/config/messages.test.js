'use strict'

const messages = require('../../lib/config/messages.js')

describe('messages', () => {
  it('should be an object', () => {
    expect(messages).toBeObject()
  })
})

describe('messages.tipNotification', () => {
  it('should be a function', () => {
    expect(messages.tipNotification).toBeFunction()
  })

  it('should return a valid string', () => {
    const username = 'marcs1970'
    const amount = '1.2'
    const usdValue = '2.1'
    const result = messages.tipNotification(username, amount, usdValue)
    expect(result).toBeString()
    expect(result).toInclude(username)
    expect(result).toInclude(amount)
    expect(result).toInclude(usdValue)
  })
})
