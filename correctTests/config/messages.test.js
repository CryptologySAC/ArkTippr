'use strict'

const messages = require('../../lib/config/messages.js')

describe('messages', () => {
  it('should be an object', () => {
    expect(messages).toBeObject()
  })
})

describe('messages.botStarted', () => {
  it('should be a function', () => {
    expect(messages.botStarted).toBeFunction()
  })

  it('should return a valid string', () => {
    const result = messages.botStarted()
    expect(result).toBeString()
  })
})

describe('messages.footer', () => {
  it('should be a function', () => {
    expect(messages.footer).toBeFunction()
  })

  it('should return a valid string', () => {
    const result = messages.footer()
    expect(result).toBeString()
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
    const txID = 'mytransactionID'
    const result = messages.tipNotification(username, amount, usdValue, txID)
    expect(result).toBeString()
    expect(result).toInclude(username)
    expect(result).toInclude(amount)
    expect(result).toInclude(usdValue)
    expect(result).toInclude(txID)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.stickersNotification', () => {
  it('should be a function', () => {
    expect(messages.stickersNotification).toBeFunction()
  })

  it('should return a valid string', () => {
    const username = 'marcs1970'
    const txID = 'mytransactionID'
    const result = messages.stickersNotification(username, txID)
    expect(result).toBeString()
    expect(result).toInclude(username)
    expect(result).toInclude(txID)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.notEnoughBalanceMessage', () => {
  it('should be a function', () => {
    expect(messages.notEnoughBalanceMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const amount = '1.2'
    const balance = '666'
    const address = 'ArkAddress'
    const result = messages.notEnoughBalanceMessage(amount, balance, address)
    expect(result).toBeString()
    expect(result).toInclude(amount)
    expect(result).toInclude(balance)
    expect(result).toInclude(address)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.balanceMessage', () => {
  it('should be a function', () => {
    expect(messages.balanceMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const amount = '1.2'
    const balance = '666'
    const result = messages.balanceMessage(amount, balance)
    expect(result).toBeString()
    expect(result).toInclude(balance)
    expect(result).toInclude(amount)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.noBalanceMessage', () => {
  it('should be a function', () => {
    expect(messages.noBalanceMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const result = messages.noBalanceMessage()
    expect(result).toBeString()
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.depositMessage', () => {
  it('should be a function', () => {
    expect(messages.depositMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const address = 'ArkAddress'
    const result = messages.depositMessage(address)
    expect(result).toBeString()
    expect(result).toInclude(address)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.transactionMessage', () => {
  it('should be a function', () => {
    expect(messages.transactionMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const receiver = 'marcs1970'
    const amount = '1.2'
    const usdValue = '2.1'
    const txID = 'mytransactionID'
    const result = messages.transactionMessage(receiver, amount, usdValue, txID)
    expect(result).toBeString()
    expect(result).toInclude(receiver)
    expect(result).toInclude(amount)
    expect(result).toInclude(usdValue)
    expect(result).toInclude(txID)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.transactionReceiveMessage', () => {
  it('should be a function', () => {
    expect(messages.transactionReceiveMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const sender = 'marcs1970'
    const amount = '1.2'
    const usdValue = '2.1'
    const txID = 'mytransactionID'
    const address = 'ArkAddress'
    const result = messages.transactionReceiveMessage(sender, amount, usdValue, address, txID)
    expect(result).toBeString()
    expect(result).toInclude(sender)
    expect(result).toInclude(amount)
    expect(result).toInclude(usdValue)
    expect(result).toInclude(txID)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.transactionWithdrawMessage', () => {
  it('should be a function', () => {
    expect(messages.transactionWithdrawMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const amount = '1.2'
    const usdValue = '2.1'
    const txID = 'mytransactionID'
    const result = messages.transactionWithdrawMessage(amount, usdValue, txID)
    expect(result).toBeString()
    expect(result).toInclude(amount)
    expect(result).toInclude(usdValue)
    expect(result).toInclude(txID)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.transactionStickersMessage', () => {
  it('should be a function', () => {
    expect(messages.transactionStickersMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const receiver = 'marcs1970'
    const amount = '1.2'
    const usdValue = '2.1'
    const txID = 'mytransactionID'
    const result = messages.transactionStickersMessage(receiver, amount, usdValue, txID)
    expect(result).toBeString()
    expect(result).toInclude(receiver)
    expect(result).toInclude(amount)
    expect(result).toInclude(usdValue)
    expect(result).toInclude(txID)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.minimumValueMessage', () => {
  it('should be a function', () => {
    expect(messages.minimumValueMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const result = messages.minimumValueMessage()
    expect(result).toBeString()
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.stickersCodeMessage', () => {
  it('should be a function', () => {
    expect(messages.stickersCodeMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const sender = 'marcs1970'
    const stickerCodD = 'ABCDE'
    const result = messages.stickersCodeMessage(sender, stickerCodD)
    expect(result).toBeString()
    expect(result).toInclude(sender)
    expect(result).toInclude(stickerCodD)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.newStickersCodeMessage', () => {
  it('should be a function', () => {
    expect(messages.newStickersCodeMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const stickerCodD = 'ABCDE'
    const txID = 'mytransactionID'
    const result = messages.newStickersCodeMessage(stickerCodD, txID)
    expect(result).toBeString()
    expect(result).toInclude(stickerCodD)
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.helpMessage', () => {
  it('should be a function', () => {
    expect(messages.helpMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const result = messages.helpMessage()
    expect(result).toBeString()
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.helpTipMessage', () => {
  it('should be a function', () => {
    expect(messages.helpTipMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const result = messages.helpTipMessage()
    expect(result).toBeString()
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.helpWithdrawMessage', () => {
  it('should be a function', () => {
    expect(messages.helpWithdrawMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const result = messages.helpWithdrawMessage()
    expect(result).toBeString()
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.helpSendMessage', () => {
  it('should be a function', () => {
    expect(messages.helpSendMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const result = messages.helpSendMessage()
    expect(result).toBeString()
    expect(result).not.toInclude('undefined')
  })
})

describe('messages.helpStickersMessage', () => {
  it('should be a function', () => {
    expect(messages.helpStickersMessage).toBeFunction()
  })

  it('should return a valid string', () => {
    const result = messages.helpStickersMessage()
    expect(result).toBeString()
    expect(result).not.toInclude('undefined')
  })
})
