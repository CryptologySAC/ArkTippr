'use strict'

const _BOT_STARTED = 'Ark Tipbot has started.'
const _FOOTER = '--- \n' +
'\n' +
'[How to use](https://np.reddit.com/r/arktippr/wiki/index) | [What is Ark?](https://ark.io) | [r/arktippr](https://np.reddit.com/r/arktippr)\n' +
'\n' +
'ARK provides users, developers, and startups with innovative blockchain technologies. Point. Click. Blockchain.'
const _TIP_NOTIFICATION = 'u/#username#. You have received `#amount# ARK ( #usdValue# US$ )`!\n'

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
}

module.exports = new Messages()
