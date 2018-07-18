'use strict'

const reddit = require('../../lib/services/reddit.js')

describe('reddit', () => {
  it('should be an Object', () => {
    expect(reddit).toBeObject()
  })
})

describe('reddit.initReddit', () => {
  it('should be a Function', () => {
    expect(reddit.initReddit).toBeFunction()
  })
})

describe('reddit.redditLoop', () => {
  it('should be a Function', () => {
    expect(reddit.redditLoop).toBeFunction()
  })
})

describe('reddit._getUnreads', () => {
  it('should be a Function', () => {
    expect(reddit._getUnreads).toBeFunction()
  })
})

describe('reddit._processInboxItem', () => {
  it('should be a Function', () => {
    expect(reddit._processInboxItem).toBeFunction()
  })
})

describe('reddit._checkSubmission', () => {
  it('should be a Function', () => {
    expect(reddit._checkSubmission).toBeFunction()
  })
})

describe('reddit._sleep', () => {
  it('should be a Function', () => {
    expect(reddit._sleep).toBeFunction()
  })
})
