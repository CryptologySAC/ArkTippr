'use strict'

const Command = require('../../lib/utils/command.js')
const mainnet = require('../__support__/mainnet.js')

describe('command', () => {
  it('should be an instance of the Command class', () => {
    const command = new Command()
    expect(command).toBeInstanceOf(Command)
  })

  it('should set internal values with the constructor', () => {
    const sender = 'senderUsername'
    const receiver = 'receiverUsername'
    const platform = 'reddit'
    const submissionID = 'IDString'
    const parentID = 'ParentIDString'

    const command = new Command(sender, receiver, platform, mainnet, submissionID, parentID)

    expect(command.sender).toBe(sender)
    expect(command.receiver).toBe(receiver)
    expect(command.mainnet).toBe(mainnet)
    expect(command.submissionID).toBe(submissionID)
    expect(command.parentID).toBe(parentID)
    expect(command.platform).toBe(platform)
  })
})
