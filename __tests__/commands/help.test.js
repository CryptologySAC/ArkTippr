'use strict'

const Help = require('../../lib/commands/help.js')

describe('help', () => {
  it('should be an instance of the Help class', () => {
    const help = new Help()
    expect(help).toBeInstanceOf(Help)
  })
})

describe('help.sendHelp', () => {
  const username = 'marcs1970'
  const help = new Help(username)

  it('should be a function', () => {
    expect(help.sendHelp).toBeFunction()
  })
})
