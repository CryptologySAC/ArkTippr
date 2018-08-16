'use strict'

const _BOT_STARTED = 'Ark Tipbot has started - #isoNow#.'

const _FOOTER_REDDIT = ' \n\n --- \n\n ' +
'[Use ArkTippr](https://np.reddit.com/r/arktippr/wiki/usage) | [FAQ](https://np.reddit.com/r/arktippr/wiki/faq) | [Ark.io](https://ark.io) | [Explore Ark](https://arkdirectory.com/) | [Terms of Use](https://np.reddit.com/r/arktippr/wiki/terms) | [r/arktippr](https://np.reddit.com/r/arktippr) \n\n ' +
'Ark provides users, developers, and startups with innovative blockchain technologies. Point. Click. Blockchain.'

const _HELP_MESSAGE_REDDIT =
'Send u/arktippr a direct message containing one (or more) of the following commands:\n\n ' +
'**BALANCE** - To see your ArkTippr wallet balance\n\n ' +
'**DEPOSIT** or **ADDRESS** - To receive instructions on how to add to your balance\n\n ' +
'**WITHDRAW** - To receive instructions on how to withdraw funds to a different Ark wallet\n\n ' +
'**TIP** - To receive instructions on how to publicly tip a Reddit user\n\n ' +
'**SEND** - To receive instructions on how to non-publicly send Ark to a Reddit user\n\n ' +
'**STICKERS** - To receive instructions on how to give a Reddit user an ArkStickers.com sticker code\n\n ' +
'[You can also visit the Usage page of the ArkTippr Wiki](https://np.reddit.com/r/arktippr/wiki/usage)\n\n '

const _HELP_MESSAGE_WHATSAPP =
'Send me a message containing one of the following commands:\n\n' +
'```BALANCE``` - To see your ArkTippr wallet balance\n\n' +
'```DEPOSIT``` or ```ADDRESS``` - To receive instructions on how to add to your balance\n\n' +
'```WITHDRAW``` - To receive instructions on how to withdraw funds to a different Ark wallet\n\n' +
'```SEND``` - To receive instructions on how to non-publicly send Ark to a WhatsApp user\n\n' +
'```STICKERS``` - To receive instructions on how to give a WhatsApp user an ArkStickers.com sticker code\n\n' +
'```CURRENCIES``` - To receive a list of supported currencies\n'

const _BALANCE_MESSAGE_REDDIT =
'Your ArkTippr wallet balance is:\n\n ' +
'`#balance# ARK ($#usdValue# USD)`\n\n ' +
'For instructions on how to withdraw Ark from your ArkTippr wallet to a different Ark address, reply WITHDRAW.\n\n '

const _NO_BALANCE_MESSAGE_REDDIT =
'Your ArkTippr wallet balance is:\n\n ' +
'`Ѧ0 ARK ($0.00 USD)`\n\n ' +
'For instructions on how to deposit Ark to your ArkTippr wallet, reply DEPOSIT.\n\n '

const _BALANCE_MESSAGE_WHATSAPP =
'Your ArkTippr wallet balance is:\n\n' +
'```#balance# ARK ($#usdValue# USD)```\n\n' +
'For instructions on how to withdraw Ark from your ArkTippr wallet to a different Ark address, reply WITHDRAW.\n\n'

const _NO_BALANCE_MESSAGE_WHATSAPP =
'Your ArkTippr wallet balance is:\n\n' +
'```0 ARK ($0.00 USD)```\n\n' +
'For instructions on how to deposit Ark to your ArkTippr wallet, reply DEPOSIT.\n\n'

const _DEPOSIT_MESSAGE_REDDIT =
'Your ArkTippr Ark address is:\n\n ' +
'`#address#`\n\n ' +
'Every Reddit user has their own unique ArkTippr wallet address, and this one is yours!\n\n ' +
'Add to your ArkTippr wallet balance by sending Ark to this address.\n\n ' +
'*You can also add this address to any official Ark wallet in Watch-Only mode, to track your balance.*\n\n '

const _DEPOSIT_MESSAGE_WHATSAPP =
'Your ArkTippr Ark address is:\n\n' +
'```#address#```\n\n' +
'Every WhatsApp user has their own unique ArkTippr wallet address, and this one is yours!\n\n' +
'Add to your ArkTippr wallet balance by sending Ark to this address.\n\n' +
'_You can also add this address to any official Ark wallet in Watch-Only mode, to track your balance._\n\n'

const _HELP_TIP_MESSAGE_REDDIT =
'To tip a user as a reward for good content, simply reply to the specific comment or post with: \n\n ' +
'    <amount> [currency] u/arktippr\n\n ' +
'This will transfer the `<amount> [currency]` converted to Ark from your ArkTippr Ark wallet to theirs - on-chain!\n\n ' +
'If the other user did not set up an ArkTippr Ark wallet yet, it still works. The Ark is waiting for them on the blockchain!\n\n ' +
'`<amount>` is the amount you like to tip *(e.g. 10, 1.5)*\n\n ' +
'`[currency]` is one of the [supported currencies](https://np.reddit.com/r/arktippr/wiki/usage#wiki_supported_currencies). ' +
'If no currency is declared, Ark is the default. \n\n '

const _HELP_SEND_MESSAGE_REDDIT =
'Sometimes, you will want to send Ark to another Reddit user privately, without a public comment that everyone can see. ' +
'This is accomplished with the SEND command. It\'s more anonymous than Venmo, and more fun than Paypal :)\n\n ' +
'To transfer Ark to a Reddit user privately, send ArkTippr a private message like this:\n\n ' +
'    SEND <username> <amount> [currency]\n\n ' +
'`<username>` should be a **valid Reddit user**\n\n ' +
'`<amount>` is the amount you like to send *(e.g. 10, 1.5)*\n\n ' +
'`[currency]` is one of the [supported currencies](https://np.reddit.com/r/arktippr/wiki/usage#wiki_supported_currencies). ' +
'If no currency is declared, Ark is the default.\n\n '

const _HELP_SEND_MESSAGE_WHATSAPP =
'*To transfer Ark to a WhatsApp user send me a message like this:*\n\n' +
'```SEND <phonenumber> <amount> [currency]```\n\n' +
'```<phonenumber>``` should be a *valid international phone number* _(e.g. +311234567890)_\n\n' +
'```<amount>``` is the amount you like to send _(e.g. 10, 1.5)_\n\n' +
'```[currency]``` is one of the supported currencies. If no currency is declared, Ark is the default.\n\n' +
'Send me ```CURRENCIES``` to receive a list of supported currencies.\n'

const _HELP_WITHDRAW_MESSAGE_REDDIT =
'You can withdraw all the Ark in your ArkTippr wallet to a different wallet:\n\n ' +
'**To withdraw the total balance:** \n\n ' +
'    WITHDRAW <address> \n\n ' +
'You can also withdraw only some of the Ark in your ArkTippr wallet to a different wallet:\n\n ' +
'**To withdraw a partial balance:** \n\n ' +
'    WITHDRAW <address> [amount] [currency] \n\n ' +
'`<address>` should be a **valid Ark wallet that you control**. WITHDRAW is irreversible so make sure the address is correct.\n\n ' +
'`[amount]` is the amount you like to withdraw *(e.g. 10, 1.5)* \n\n ' +
'`[currency]` is one of the [supported currencies](https://np.reddit.com/r/arktippr/wiki/usage#wiki_supported_currencies) ' +
'If no currency is declared, Ark is the default. \n\n '

const _HELP_WITHDRAW_MESSAGE_WHATSAPP =
'You can withdraw all the Ark in your ArkTippr wallet to a different wallet:\n\n' +
'*To withdraw the total balance:*\n\n' +
'```WITHDRAW <address>``` \n\n' +
'You can also withdraw only some of the Ark in your ArkTippr wallet to a different wallet:\n\n' +
'*To withdraw a partial balance:*\n\n' +
'```WITHDRAW <address> [amount] [currency]``` \n\n' +
'```<address>``` should be a *valid Ark wallet that you control*. WITHDRAW is irreversible so make sure the address is correct.\n\n' +
'```[amount]``` is the amount you like to withdraw _(e.g. 10, 1.5)_ \n\n' +
'```[currency]``` is one of the supported currencies. If no currency is declared, Ark is the default.\n\n' +
'Send me ```CURRENCIES``` to receive a list of supported currencies.\n'

const _SEND_NO_BALANCE_MESSAGE_WHATSAPP =
'*Unfortunately, your ArkTippr wallet does not have a sufficient balance for this transaction.*\n\n' +
'You tried to send ```#amount# ARK``` but your ArkTippr wallet only contains ```#balance# ARK```. ' +
'Perhaps the transaction failed due to not accounting for the Ark network transaction fee.\n\n' +
'Your ArkTippr wallet address is:\n\n' +
'```#address#``` \n\n' +
'Add Ark to your balance at that address and retry.\n\n' +
'Thank you!\n\n '

const _SEND_NO_BALANCE_MESSAGE_REDDIT =
'Unfortunately, your ArkTippr wallet does not have a sufficient balance for this transaction.\n\n ' +
'You tried to send #amount# ARK but your ArkTippr wallet only contains #balance# ARK. ' +
'Perhaps the transaction failed due to not accounting for the Ark network transaction fee.\n\n ' +
'Your ArkTippr wallet address is **#address#** \n\n ' +
'Add Ark to your balance at that address and retry.\n\n ' +
'Thank you!\n\n '

const _HELP_CURRENCIES_WHATSAPP =
'Currently ArkTippr supports the following currencies:\n\n' +
' ```ARK``` | ```Ѧ``` - Ark \n' +
' ```USD``` | ```$``` - United States dollar \n' +
' ```EUR``` | ```€``` - Euro  \n' +
' ```GBP``` - British pound \n' +
' ```BTC``` - Bitcoin Core \n' +
' ```BCH``` - Bitcoin Cash \n' +
' ```ETH``` - Ether \n' +
' ```XRP``` - Ripple \n' +
' ```LTC``` - Litecoin \n' +
' ```AUD``` - Australian dollar \n' +
' ```BRL``` - Brazilian real \n' +
' ```CAD``` - Canadian dollar \n' +
' ```CHF``` - Swiss franc \n' +
' ```CLP``` - Chilean peso \n' +
' ```CNY``` - Chinese yuan \n' +
' ```CZK``` - Czech koruna \n' +
' ```DKK``` - Danish krone \n' +
' ```HKD``` - Hong Kong dollar \n' +
' ```HUF``` - Hungarian forint \n' +
' ```IDR``` - Indonesian rupiah \n' +
' ```ILS``` - Israeli new shekel \n' +
' ```INR``` - Indian rupee \n' +
' ```JPY``` - Japanese yen \n' +
' ```KRW``` -  South Korean won \n' +
' ```MXN``` - Mexican peso \n' +
' ```MYR``` - Malaysian ringgit \n' +
' ```NOK``` - Norwegian krone \n' +
' ```NZD``` - New Zealand dollar \n' +
' ```PHP``` - Philippine piso \n' +
' ```PKR``` - Pakistani rupee \n' +
' ```PLN``` - Polish złoty \n' +
' ```RUB``` - Russian ruble \n' +
' ```SEK``` - Swedish krona \n' +
' ```SGD``` - Singapore dollar \n' +
' ```THB``` - Thai baht \n' +
' ```TRY``` - Turkish lira \n' +
' ```TWD``` - New Taiwan dollar \n' +
' ```ZAR``` - South African rand\n'

const _SUMMONED_NOTIFICATION_REDDIT = 'ArkTippr tipbot here- I have been summoned, but I\'m having trouble understanding what to do. ' +
'I do enjoy a zero before a decimal if that\'s the issue!'

const _SUMMONED_NOTIFICATION_WHATSAPP = 'I have been summoned, but I\'m having trouble understanding what to do. ' +
'I do enjoy a zero before a decimal if that\'s the issue! You can always send me a message with \'HELP\' to receive instructions.'

const _TIP_NOTIFICATION = 'u/#username#. You have received ` #amount# ARK ($#usdValue# USD) `!\n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '

const _STICKERS_NOTIFICATION = 'u/#username#. You have received a free ArkStickers sticker set!\n\n ' +
'ArkTippr has sent you a private message with a code to redeem on [ArkStickers.com](https://arkstickers.com). \n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '

const _TRANSACTION_MESSAGE = '\n\n ' +
'Your transaction to u/#receiver# was successful!\n\n ' +
'You sent #amount# ARK ($#usdValue# USD) from your ArkTippr wallet.\n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '

const _TRANSACTION_RECEIVE_MESSAGE = '\n\n ' +
'/u/#username# has sent you  #amount# ARK ($#usdValue# USD) directly via ArkTippr!\n\n ' +
'For reference, your personal ArkTippr wallet address is #address#\n\n ' +
'For assistance withdrawing this Ark to a different wallet, reply **WITHDRAW** or visit the ' +
'[Usage page of the ArkTippr Wiki](https://np.reddit.com/r/arktippr/wiki/usage)\n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '

const _TRANSACTION_DONATION_MESSAGE = '\n\n ' +
'Thank you for your donation! Your support means the world to us.\n\n ' +
'You have successfully donated #amount# ARK ($#usdValue# USD) to ArkTippr\'s wallet.\n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '

const _TRANSACTION_WITHDRAW_MESSAGE = '\n\n ' +
'You withdrew funds from your ArkTippr wallet successfully! \n\n ' +
'#amount# ARK ($#usdValue# USD) was transferred out of your ArkTippr wallet.\n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '

const _TRANSACTION_STICKERS_MESSAGE = '\n\n ' +
'Thank you! ArkTippr has successfully sent an ArkStickers code to the private messages of u/#receiver#. They know it came from you- your generosity levels are over nine thousand! \n\n ' +
'ArkTippr successfully transferred #amount# ARK ($#usdValue# USD) from your ArkTippr wallet to the ArkStickers Ark address.\n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '

const _MINIMAL_TRANSACTION_VALUE_REDDIT =
'You tried to execute a transaction below the minimum amount, Ѧ0.2 ARK.\n\n ' +
'Please try again, with an amount of Ѧ0.2 ARK or higher. Cheers!\n\n '

const _MINIMAL_TRANSACTION_VALUE_WHATSAPP =
'*You tried to execute a transaction below the minimum amount, Ѧ0.2 ARK.*\n\n' +
'Please try again, with an amount of Ѧ0.2 ARK or higher. Cheers!\n'

const _STICKERS_CODE_MESSAGE = '\n\n ' +
'**Congratulations!** /u/#sender# has paid for you to receive a **FREE** ArkStickers sticker set.\n\n ' +
'Go to [ArkStickers.com](https://arkstickers.com) and use this 1-time code: **#stickerCode#**\n\n ' +
'You do not need to have Ark or execute a transaction to claim the free stickers.\n\n ' +
'/u/#sender# has taken care of everything for you, and you do not need to pay or do anything other than receive the stickers.\n\n ' +
'Stickers are delivered all around the world. Cheers and enjoy!\n\n '

const _STICKERS_CODE_NEWCODE = '\n\n ' +
'A new code has been generated: **#stickerCode#**\n\n ' +
'Please check the transaction below to confirm you have received the funds.\n\n ' +
'[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n '

const _HELP_STICKERS_MESSAGE_REDDIT =
'[ArkStickers](https://ArkStickers.com) has created a great set of stickers and Ark info sheet that can be used to promote Ark technology.\n\n ' +
'When you use the STICKERS command, you will give that user (or yourself) a code redeemable at ArkStickers.com for a sticker set, and it never expires!\n\n ' +
'There are two ways to accomplish this:\n\n ' +
'**1) Publicly reply to a comment or post** \n\n ' +
'To send a Reddit user an ArkStickers sticker code, comment on their post or reply to their comment with:\n\n ' +
'    STICKERS u/arktippr\n\n ' +
'This will do the following:\n\n ' +
'1 Send Ѧ2 ARK from your balance to ArkStickers.com Ark wallet\n\n ' +
'2 Generate an ArkStickers stickers code\n\n ' +
'3 Send the code privately to the user in question via Reddit private message.\n\n ' +
'They will receive a code that you paid for in their messages Inbox, and they can use their code on ArkStickers.com to get their stickers for free ' +
'(no Ark transaction required for them).\n\n ' +
'Everyone on Reddit will see that you gave them stickers!\n\n ' +
'Sticker codes can only be used one time.\n\n ' +
'**2) Send ArkTippr a Private Message** \n\n ' +
'You can also do this by sending ArkTippr a private message with the command:\n\n ' +
'    STICKERS <username>\n\n ' +
'This will do the following:\n\n ' +
'1 Send Ѧ2 ARK from your balance to ArkStickers.com Ark wallet\n\n ' +
'2 Generate an ArkStickers stickers code\n\n ' +
'3 Send the code privately to the user in question via Reddit private message.\n\n ' +
'*(This method allows you to get a code sent to yourself if you want to.)* \n\n ' +
'They will receive a code that you paid for in their messages Inbox, and they can use their code on ArkStickers.com to get their stickers for free ' +
'(no Ark transaction required for them).\n\n ' +
'This method does not use public comments, so no one will see that you gave them stickers.\n\n ' +
'Sticker codes can only be used one time.\n\n' +
'**Did You Know?** You can use STICKERS for any Reddit user on any Subreddit- you are not confined to Ark\'s Subreddit!\n\n '

const _HELP_STICKERS_MESSAGE_WHATSAPP =
'ArkStickers has created a great set of stickers and Ark info sheet that can be used to promote Ark technology.\n\n' +
'When you use the STICKERS command, you will give that user (or yourself) a code redeemable at ArkStickers.com for a sticker set, and it never expires!\n\n' +
'You can do this by sending ArkTippr a private message with the command:\n\n' +
'```STICKERS <phonenumber>```\n\n' +
'```<phonenumber>``` should be a *valid international phone number* _(e.g. +311234567890)_\n\n' +
'This will do the following:\n\n' +
'1 Send Ѧ2 ARK from your balance to ArkStickers.com Ark wallet\n\n' +
'2 Generate an ArkStickers stickers code\n\n' +
'3 Send the code privately to the user in question via a WhatsApp message.\n\n' +
'They will receive a code that you paid for, and they can use their code on ArkStickers.com to get their stickers for free ' +
'(no Ark transaction required for them).\n\n' +
'Sticker codes can only be used one time.\n\n'

const _NOTIFICATION_NO_BALANCE = 'ArkTippr here- not to get awkward, but this user can\'t execute that transaction right now...' +
'for reasons.  Perhaps they will try again soon!\n\n '



class Messages {
  botStarted (isoNow) {
    const message = _BOT_STARTED
      .replace('#isoNow#', isoNow)
    return message
  }

  footer (platform) {
    switch (platform) {
      case 'reddit':
      default:
        return _FOOTER_REDDIT
      case 'whatsapp':
        return ''
    }
  }

  helpMessage (platform) {
    switch (platform) {
      case 'reddit':
      default:
        return _HELP_MESSAGE_REDDIT
      case 'whatsapp':
        return _HELP_MESSAGE_WHATSAPP
    }
  }

  balanceMessage (balance, usdValue, platform) {
    let message
    switch (platform) {
      case 'reddit':
      default:
        message = _BALANCE_MESSAGE_REDDIT
        break
      case 'whatsapp':
        message = _BALANCE_MESSAGE_WHATSAPP
    }
    message = message
      .replace('#balance#', balance)
      .replace('#usdValue#', usdValue)

    return message
  }

  noBalanceMessage (platform) {
    switch (platform) {
      case 'reddit':
      default:
        return _NO_BALANCE_MESSAGE_REDDIT
      case 'whatsapp':
        return _NO_BALANCE_MESSAGE_WHATSAPP
    }
  }

  depositMessage (address, platform) {
    let message
    switch (platform) {
      case 'reddit':
      default:
        message = _DEPOSIT_MESSAGE_REDDIT
        break
      case 'whatsapp':
        message = _DEPOSIT_MESSAGE_WHATSAPP
    }

    message = message
      .replace('#address#', address)

    return message
  }

  helpTipMessage (platform) {
    switch (platform) {
      case 'reddit':
      default:
        return _HELP_TIP_MESSAGE_REDDIT
      case 'whatsapp':
        return _HELP_MESSAGE_WHATSAPP
    }
  }

  helpSendMessage (platform) {
    switch (platform) {
      case 'reddit':
      default:
        return _HELP_SEND_MESSAGE_REDDIT
      case 'whatsapp':
        return _HELP_SEND_MESSAGE_WHATSAPP
    }
  }

  helpWithdrawMessage (platform) {
    switch (platform) {
      case 'reddit':
      default:
        return _HELP_WITHDRAW_MESSAGE_REDDIT
      case 'whatsapp':
        return _HELP_WITHDRAW_MESSAGE_WHATSAPP
    }
  }

  helpCurrenciesMessage (platform) {
    switch (platform) {
      case 'reddit':
      default:
        return _HELP_MESSAGE_REDDIT
      case 'whatsapp':
        return _HELP_CURRENCIES_WHATSAPP
    }
  }
  
  summonedReply (platform) {
    switch (platform) {
      case 'reddit':
      default:
        return _SUMMONED_NOTIFICATION_REDDIT
      case 'whatsapp':
        return _SUMMONED_NOTIFICATION_WHATSAPP
    }
  }

  helpStickersMessage (platform) {
    switch (platform) {
      case 'reddit':
      default:
        return _HELP_STICKERS_MESSAGE_REDDIT
      case 'whatsapp':
        return _HELP_STICKERS_MESSAGE_WHATSAPP
    }
  }

  minimumValueMessage (platform) {
    switch (platform) {
      case 'reddit':
      default:
        return _MINIMAL_TRANSACTION_VALUE_REDDIT
      case 'whatsapp':
        return _MINIMAL_TRANSACTION_VALUE_WHATSAPP
    }
  }

  notEnoughBalanceMessage (amount, balance, address, platform) {
    let message
    switch (platform) {
      case 'reddit':
      default:
        message = _SEND_NO_BALANCE_MESSAGE_REDDIT
        break
      case 'whatsapp':
        message = _SEND_NO_BALANCE_MESSAGE_WHATSAPP
        break
    }
    message = message
      .replace('#amount#', amount)
      .replace('#balance#', balance)
      .replace('#address#', address)

    return message
  }

  tipNotification (username, amount, usdValue, transactionId) {
    let message = _TIP_NOTIFICATION
      .replace('#username#', username)
      .replace('#amount#', amount)
      .replace('#usdValue#', usdValue)
      .replace('#transactionId#', transactionId)

    return message
  }

  stickersNotification (username, transactionId) {
    let message = _STICKERS_NOTIFICATION
      .replace('#username#', username)
      .replace('#transactionId#', transactionId)

    return message
  }

  noBalanceNotification () {
    return _NOTIFICATION_NO_BALANCE
  }

  transactionMessage (receiver, amount, usdValue, transactionId) {
    let message = _TRANSACTION_MESSAGE
      .replace('#receiver#', receiver)
      .replace('#amount#', amount)
      .replace('#usdValue#', usdValue)
      .replace('#transactionId#', transactionId)

    return message
  }

  transactionReceiveMessage (username, amount, usdValue, address, transactionId) {
    let message = _TRANSACTION_RECEIVE_MESSAGE
      .replace('#username#', username)
      .replace('#amount#', amount)
      .replace('#usdValue#', usdValue)
      .replace('#address#', address)
      .replace('#transactionId#', transactionId)

    return message
  }

  transactionDonationMessage (amount, usdValue, transactionId) {
    let message = _TRANSACTION_DONATION_MESSAGE
      .replace('#amount#', amount)
      .replace('#usdValue#', usdValue)
      .replace('#transactionId#', transactionId)

    return message
  }

  transactionWithdrawMessage (amount, usdValue, transactionId) {
    let message = _TRANSACTION_WITHDRAW_MESSAGE
      .replace('#amount#', amount)
      .replace('#usdValue#', usdValue)
      .replace('#transactionId#', transactionId)

    return message
  }

  transactionStickersMessage (receiver, amount, usdValue, transactionId) {
    let message = _TRANSACTION_STICKERS_MESSAGE
      .replace('#receiver#', receiver)
      .replace('#amount#', amount)
      .replace('#usdValue#', usdValue)
      .replace('#transactionId#', transactionId)

    return message
  }

  stickersCodeMessage (sender, stickerCode) {
    let message = _STICKERS_CODE_MESSAGE
      .replace('#stickerCode#', stickerCode)
      .replace('#sender#', sender)
      .replace('#sender#', sender)

    return message
  }

  newStickersCodeMessage (transactionId, stickerCode) {
    let message = _STICKERS_CODE_NEWCODE
      .replace('#stickerCode#', stickerCode)
      .replace('#transactionId#', transactionId)

    return message
  }
}

module.exports = new Messages()
