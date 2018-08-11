'use strict'

const Help = require('../../lib/commands/help.js')
const platformReddit = 'reddit'
const platformWhatsApp = 'whatsapp'
const usernameReddit = 'marcs1970'
const usernameWhatsApp = '+31638053467'

const helpReddit = new Help(usernameReddit, platformReddit)
const helpWhatsApp = new Help(usernameWhatsApp, platformWhatsApp)

describe('help', () => {
  it('should be an Object', () => {
    expect(helpReddit).toBeObject()
    expect(helpWhatsApp).toBeObject()
  })
})

describe('help.sendHelp', () => {

  it('should be a function', () => {
    expect(helpReddit.sendHelp).toBeFunction()
  })
})

describe('help.__sendReddit', () => {

  it('should be a function', () => {
    expect(helpReddit.__sendReddit).toBeFunction()
  })
})

describe('help.__sendWhatsApp', () => {

  it('should be a function', () => {
    expect(helpWhatsApp.__sendWhatsApp).toBeFunction()
  })
})
