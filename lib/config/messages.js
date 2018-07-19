'use strict'

const _BOT_STARTED = 'Ark Tipbot has started.'
const _FOOTER = '\n\n\n--- \n' +
'\n' +
'[How to use](https://np.reddit.com/r/arktippr/wiki/index) | [What is Ark?](https://ark.io) | [r/arktippr](https://np.reddit.com/r/arktippr)\n' +
'\n' +
'Ark provides users, developers, and startups with innovative blockchain technologies. Point. Click. Blockchain.'
const _TIP_NOTIFICATION = 'u/#username#. You have received `#amount# ARK ($#usdValue# USD)`!\n'
const _BALANCE_MESSAGE = '##Ark Balance##\n\n' +
'Your balance is: `#balance# ARK ($#usdValue# USD)`.\n\n' +
'If you like to know how to withdraw your Ark then simply reply to this message with the command: `WITHDRAW` and I will send you instructions.\n'
const _NO_BALANCE_MESSAGE = '##Ark Balance##\n\n' +
'\n' +
'I could not retrieve your balance for you at this moment: \n\n' +
'- did you already receive any tips?\n\n' +
'- or have you already deposited Ark?\n' +
'\n\n' +
'If you like to know how to deposit Ark then simply reply to this message with the command: `DEPOSIT` and I will send you instructions.\n'
const _DEPOSIT_MESSAGE = '##Ark Deposit##\n\n' +
'Your personal Ark address is:\n\n' +
'`#address#`\n\n' +
'Send however much Ark you\'d like to deposit to this address.\n\n'

class Messages {
  botStarted () {
    return _BOT_STARTED
  }

  footer () {
    return _FOOTER
  }

  tipNotification (username, amount, usdValue) {
    let message = _TIP_NOTIFICATION
      .replace('#username#', username)
      .replace('#amount#', amount)
      .replace('#usdValue#', usdValue)

    return message
  }

  balanceMessage (balance, usdValue) {
    let message = _BALANCE_MESSAGE
      .replace('#balance#', balance)
      .replace('#usdValue#', usdValue)

    return message
  }

  noBalanceMessage () {
    return _NO_BALANCE_MESSAGE
  }

  depositMessage (address) {
    let message = _DEPOSIT_MESSAGE
      .replace('#address#', address)

    return message
  }
}

module.exports = new Messages()
