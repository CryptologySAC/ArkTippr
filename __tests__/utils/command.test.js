'use strict'

const Command = require('../../lib/utils/command.js')

describe('command', () => {
  it('should be an instance of the Command class', () => {
    const command = new Command()
    expect(command).toBeInstanceOf(Command)
  })

  it('should set internal values with the constructor', () => {
    const sender = 'senderUsername'
    const receiver = 'receiverUsername'
    const mainnet = 'mainnetObject'
    const submissionID = 'IDString'
    const parentID = 'IDString'

    const command = new Command(sender, receiver, mainnet, submissionID, parentID)

    expect(command.sender).toBe(sender)
    expect(command.receiver).toBe(receiver)
    expect(command.mainnet).toBe(mainnet)
    expect(command.submissionID).toBe(submissionID)
    expect(command.parentID).toBe(parentID)
  })
})

describe('command.parseBody', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command.parseBody).toBeFunction()
  })
})

describe('command._parseMention', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command._parseMention).toBeFunction()
  })
})

describe('command._parseCommand', () => {
  const command = new Command()

  it('should be a function', () => {
    expect(command._parseCommand).toBeFunction()
  })
})

describe('command._parseSend', () => {
  const username = 'arktippr'
  const badUsername = 'thisusershouldnotexistbadbadbadqwerty'
  const badAmount = 'none'
  const amount = '1'
  const currency = 'ARK'
  const command = new Command()

  it('should be a function', () => {
    expect(command._parseSend).toBeFunction()
  })

  it('should return null for invalid username', async () => {
    const result = await command._parseSend(badUsername, amount, currency)
    expect(result).toBeNil()
  })

  it('should return null for valid username and bad amount', async () => {
    const result = await command._parseSend(username, badAmount, currency)
    expect(result).toBeNil()
  })

  it('should return a {amount, currency} object for valid username, amount and currency', async () => {
    const result = await command._parseSend(username, amount, currency)
    expect(result).toBeObject()
    expect(result).toContainKeys(['amount', 'currency'])
  })
})
