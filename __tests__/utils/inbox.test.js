'use strict'

const inbox = require('../../lib/utils/inbox.js')

describe('inbox', () => {
  it('should be an Object', () => {
    expect(inbox).toBeObject()
  })
})

describe('inbox.initReddit', () => {
  it('should be a Function', () => {
    expect(inbox.initReddit).toBeFunction()
  })
})

describe('inbox.redditLoop', () => {
  it('should be a Function', () => {
    expect(inbox.redditLoop).toBeFunction()
  })
})

describe('inbox._getUnreads', () => {
  it('should be a Function', () => {
    expect(inbox._getUnreads).toBeFunction()
  })

  it('should return an array of validinbox items', async () => {
    const result = await inbox._getUnreads()
    expect(result).toBeArray()
  })
})

describe('inbox._processInboxItem', () => {
  it('should be a Function', () => {
    expect(inbox._processInboxItem).toBeFunction()
  })
})

describe('inbox._checkSubmission', () => {
  it('should be a Function', () => {
    expect(inbox._checkSubmission).toBeFunction()
  })
})

describe('inbox._sleep', () => {
  it('should be a Function', () => {
    expect(inbox._sleep).toBeFunction()
  })

  it('should sleep for the amount of ms entered', async () => {
    const now = Date.now()
    const sleepFor = 2000
    await inbox._sleep(sleepFor)
    const later = Date.now()
    expect(later).toBeGreaterThanOrEqual(now + sleepFor)
  })
})

describe('inbox._notifyManager', () => {
  it('should be a Function', () => {
    expect(inbox._notifyManager).toBeFunction()
  })
})
