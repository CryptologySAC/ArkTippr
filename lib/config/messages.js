'use strict'

const _BOT_STARTED = 'Ark Tipbot has started.'
const _FOOTER = '\n\n\n--- \n' +
'\n' +
'[How to use](https://np.reddit.com/r/arktippr/wiki/index) | [What is Ark?](https://ark.io) | [r/arktippr](https://np.reddit.com/r/arktippr) | [Terms of use](https://np.reddit.com/r/arktippr/wiki/terms)\n' +
'\n' +
'Ark provides users, developers, and startups with innovative blockchain technologies. Point. Click. Blockchain.'
const _TIP_NOTIFICATION = 'u/#username#. You have received ` #amount# ARK ($#usdValue# USD) `!\n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '
const _SEND_NO_BALANCE_MESSAGE = '##Ark Tipbot | Error: insufficient balance##\n\n' +
'You do not have sufficient balance in your wallet for this transaction. Please deposit first and then try again.\n\n '
const _BALANCE_MESSAGE = '\n\n ' +
'Your balance is: ` #balance# ARK ($#usdValue# USD) `.\n\n' +
'If you like to know how to withdraw your Ark then simply reply to this message with the command: `WITHDRAW` and I will send you instructions.\n'
const _NO_BALANCE_MESSAGE = '\n\n ' +
'Your balance is: ` Ѧ0.00000000 ARK ($0.00 USD) `.\n\n' +
'\n\n' +
'If you like to know how to deposit Ark then simply reply to this message with the command: `DEPOSIT` and I will send you instructions.\n'
const _DEPOSIT_MESSAGE = '\n\n ' +
'Your personal Ark address is:\n\n' +
'` #address# `\n\n' +
'Send however much Ark you\'d like to deposit to this address.\n\n' +
'You can also add this address to any official Ark wallet (watch only)\n\n'
const _VOTE_MESSAGE = '\n\n ' +
'**Looks like you\'re trying to vote, great!**\n\n' +
'Voting is something essential in the Ark Ecosystem. Unfortunately we do not allow you to vote with your Arktippr Ark wallet. For security reasons it is not smart to store large amounts of Ark on Reddit and we feel that you should withdraw to an official wallet and vote there.\n\n' +
'---\n\n' +
'Instead of Proof-of-Work or Proof-of-Stake, Ark uses a Delegated Proof-of-Stake (DPOS) consensus algorithm. There are 51 delegates that “forge” Ark and help secure the network. By voting for a delegate you can stake your Ark and then receive Ark from that delegate.\n\n' +
'You can visit [Arkdelegates.io](https://arkdelegates.io/) to learn more about the delegates and discover who would be the best for you.\n\n'
const _HELP_MESSAGE = '\n\n ' +
'Please visit [Help](https://np.reddit.com/r/arktippr/wiki/usage) for advanced usage instructions.\n\n\n\n' +
'**Send u/arktippr a direct message containing on (or more) of the following commands:**\n\n' +
'`BALANCE` - To see your balance\n\n' +
'`DEPOSIT` or `ADDRESS` - To receive instructions how to top up your balance\n\n' +
'`WITHDRAW` - To receive instructions how to redeem your balance\n\n' +
'`TIP` - To receive instructions on how to tip a Reddit user\n\n' +
'`VOTE` - To receive instructions on Ark voting.\n\n' +
'`SEND` - To receive instructions how to send Ark to a Reddit user\n\n' +
'`DONATE` - To receive instructions how to make a donation to the creator of the Arktippr tipbot\n\n' +
'`STICKERS` - To receive instructions on the to give a Reddit user an Arkstickers.com sticker set.\n\n'
const _HELP_WITHDRAW_MESSAGE = '\n\n ' +
'To withdraw (part of) your Ark balance send me a direct message with the following command:\n\n' +
'###To withdraw complete balance:\n\n' +
'    WITHDRAW <address>\n\n' +
'###To withdraw a part of your balance:\n\n' +
'    WITHDRAW <address> [amount] [currency]\n\n' +
'* `<address>` should be a **valid Ark wallet that you control**\n\n' +
'* `[amount]` is the amount you like to withdraw *(e.g. 10, 1.5)*\n\n' +
'* `[currency]` is one of the supported currencies *default ARK*\n\n' +
'Please visit [Help](https://np.reddit.com/r/arktippr/wiki/usage#wiki_supported_currencies) to see which currencies are supported.\n\n'
const _HELP_TIP_MESSAGE = '\n\n ' +
'To tip a user to reward good content simply reply to the comment/post you like to reward with: \n\n' +
'    <amount> [currency] u/arktippr\n\n' +
'This will transfer the `<amount> [currency]` converted to Ark from your arktippr Ark wallet to theirs - on chain!\n\n' +
'If they don\'t have an Ark wallet with arktippr yet we will generate them one.\n\n' +
'* `<amount>` is the amount you like to tip *(e.g. 10, 1.5)*\n\n' +
'* `[currency]` is one of the supported currencies *default ARK*\n\n' +
'Please visit [Help](https://np.reddit.com/r/arktippr/wiki/usage#wiki_supported_currencies) to see which currencies are supported.\n\n'
const _HELP_SEND_MESSAGE = '\n\n ' +
'You can send Ark from your arktippr Ark wallet to any Reddit user (this beats PayPal ;)). To transfer Ark to a Reddit user send me a message with:\n\n' +
'`SEND <username> <amount> [currency]`\n\n' +
'or\n\n' +
'`SEND <username> <currency> <amount>`\n\n' +
'* `<username>` should be a **valid Reddit user**\n\n' +
'* `<amount>` is the amount you like to send *(e.g. 10, 1.5)*\n\n' +
'* `[currency]` is one of the [supported currencies](https://np.reddit.com/r/arktippr/wiki/usage#wiki_supported_currencies)  *default ARK\n\n' +
'**Examples:** \n\n' +
'Sending me a message with:\n\n' +

'    SEND 5 USD bobby\n\n' +
'will transfer (*from your arktippr Ark Wallet*) the amount of Ark with the current value of $5.00 USD to Bobby.\n\n' +

'    SEND 7.865 bobby\n\n' +
'will transfer Ѧ7.865 ARK to Bobby\n\n'
const _HELP_DONATE_MESSAGE = '\n\n ' +
'The Arktippr Ark Tipbot is an Ark community project run by volenteers. If you like to show your appreciation you could do so by sending me a message with:\n\n' +
'`DONATE <amount> [currency]`\n\n' +
'* `<amount>` is the amount you like to send *(e.g. 10, 1.5)*\n\n' +
'* `[currency]` is one of the [supported currencies](https://np.reddit.com/r/arktippr/wiki/usage#wiki_supported_currencies)  *default ARK\n\n' +
'**Example:**\n\n' +
'Sending me a message with:\n\n' +
'    DONATE 10 ARK \n\n' +
'will donate and transfer Ѧ10 ARK to arktippr\n\n'
const _HELP_STICKERS_MESSAGE = '\n\n ' +
'[ArkStickers](https://ArkStickers.com) has created a great set of stickers that can be used to promote Ark. You can sponsor any Reddit user (or yourself) with a set of Ark stickers in two ways:\n\n' +
'**Reply to a comment** \n\n' +
'To send a Reddit user a Ark sticker sponsor code (for a free set of Ark stickers) comment on their post or reply to their comment with:\n\n' +
'`stickers u/arktippr`\n\n' +
'**Send me a Private Message** \n\n' +
'You can also do this by sending me a message with the command:\n\n' +
'`STICKERS <username>`\n\n' +
'This will do the following:\n\n' +
'1. Send Ѧ2 ARK from your balance to ArkStickers.com Ark wallet;\n\n' +
'2. Generates an Ark Stickers sponsor code;\n\n' +
'3. Send this sponsor code to both your receiver and ArkStickers.com.\n\n ' +
'Your receiver will get clear instructions on how to redeem his/her stickers. You can also add your own username if you like to reive a set of Ark Stickers yourself.\n\n'
const _TRANSACTION_MESSAGE = '\n\n ' +
'You have succesfully transferred ` #amount# ARK ($#usdValue# USD) ` from your wallet.\n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '
const _TRANSACTION_RECEIVE_MESSAGE = '\n\n ' +
'You have succesfully received ` #amount# ARK ($#usdValue# USD) ` from /u/#username#.\n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '
const _TRANSACTION_DONATION_MESSAGE = '\n\n ' +
'Thank you for your donation! Your support means the world to us. \n\n '

class Messages {
  botStarted () {
    return _BOT_STARTED
  }

  footer () {
    return _FOOTER
  }

  tipNotification (username, amount, usdValue, transactionId) {
    let message = _TIP_NOTIFICATION
      .replace('#username#', username)
      .replace('#amount#', amount)
      .replace('#usdValue#', usdValue)
      .replace('#transactionId#', transactionId)

    return message
  }

  transactionMessage (amount, usdValue, transactionId) {
    let message = _TRANSACTION_MESSAGE
      .replace('#amount#', amount)
      .replace('#usdValue#', usdValue)
      .replace('#transactionId#', transactionId)

    return message
  }

  transactionReceiveMessage (username, amount, usdValue, transactionId) {
    let message = _TRANSACTION_RECEIVE_MESSAGE
      .replace('#username#', username)
      .replace('#amount#', amount)
      .replace('#usdValue#', usdValue)
      .replace('#transactionId#', transactionId)

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

  voteMessage () {
    return _VOTE_MESSAGE
  }

  helpMessage () {
    return _HELP_MESSAGE
  }

  helpTipMessage () {
    return _HELP_TIP_MESSAGE
  }

  helpWithdrawMessage () {
    return _HELP_WITHDRAW_MESSAGE
  }

  helpSendMessage () {
    return _HELP_SEND_MESSAGE
  }

  helpDonateMessage () {
    return _HELP_DONATE_MESSAGE
  }

  helpStickersMessage () {
    return _HELP_STICKERS_MESSAGE
  }

  notEnoughBalanceMessage () {
    return _SEND_NO_BALANCE_MESSAGE
  }

  transactionDonationMessage () {
    return _TRANSACTION_DONATION_MESSAGE
  }
}

module.exports = new Messages()
