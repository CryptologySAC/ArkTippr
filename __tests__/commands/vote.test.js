'use strict'

const Vote = require('../../lib/commands/vote.js')

describe('vote', () => {
  it('should be an instance of the Vote class', () => {
    const vote = new Vote()
    expect(vote).toBeInstanceOf(Vote)
  })
})

describe('vote.sendVote', () => {
  const username = 'marcs1970'
  const vote = new Vote(username)

  it('should be a function', () => {
    expect(vote.sendVote).toBeFunction()
  })
})
