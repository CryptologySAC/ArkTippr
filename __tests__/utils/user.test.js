'use strict'

const User = require('../../lib/utils/user.js')
const mainnet = require('../__support__/mainnet.js')

describe('user', () => {
  it('should be an instance of the User class', () => {
    const user = new User()
    expect(user).toBeInstanceOf(User)
  })

  it('should set internal values with the constructor', () => {
    const username = 'aUsername'
    const user = new User(username)

    expect(user.username).toBe(username)
  })
})

describe('user.isValidUser', () => {
  const validUsername = 'arktippr'
  const validUsernameSlash = 'u/arktippr'
  const badUsername = 'thisusershouldnotexistbadbadbadqwerty'
  const user = new User(validUsername)
  const userSlash = new User(validUsernameSlash)
  const badUser = new User(badUsername)

  it('should be a function', () => {
    expect(user.isValidUser).toBeFunction()
  })

  it('should return true if the user is valid', async () => {
    let result = await user.isValidUser()
    expect(result).toBeTrue()

    result = await userSlash.isValidUser()
    expect(result).toBeTrue()
  })

  it('should return false if the user is invalid', async () => {
    const result = await badUser.isValidUser()
    expect(result).toBeFalse()
  })
})

describe('user.getBalance', () => {
  const username = 'marcs1970'
  const user = new User(username)

  it('should be a function', () => {
    expect(user.getBalance).toBeFunction()
  })

  it('should return a value for a correct balance ', async () => {
    let balance = await user.getBalance(mainnet)
    expect(balance).toBe(5)

    mainnet.setUnconfirmedBalance('2')
    balance = await user.getBalance(mainnet)
    expect(balance).toBe(2)

    mainnet.setUnconfirmedBalance('6')
    balance = await user.getBalance(mainnet)
    expect(balance).toBe(5)
  })

  it('should return 0 for an empty balance ', async () => {
    mainnet.setBadsender(true)
    const balance = await user.getBalance(mainnet)
    expect(balance).toBe(0)
  })
})

describe('user._getSeedFromSecret', () => {
  const user = new User()

  it('should be a function', () => {
    expect(user._getSeedFromSecret).toBeFunction()
  })

  it('should correctly decrypt an encrypted seed', () => {
    const seed = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
    const encryptedSeed = user._generateSecretFromSeed(seed)
    const decryptedSeed = user._getSeedFromSecret(encryptedSeed)

    expect(decryptedSeed).toBe(seed)
  })
})

describe('user._generateSecretFromSeed', () => {
  const user = new User()

  it('should be a function', () => {
    expect(user._generateSecretFromSeed).toBeFunction()
  })

  it('should correctly encrypt a seed', () => {
    const seed = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
    const encryptedSeed = user._generateSecretFromSeed(seed)
    const decryptedSeed = user._getSeedFromSecret(encryptedSeed)

    expect(encryptedSeed).toBeString()
    expect(encryptedSeed).toInclude(':')
    expect(decryptedSeed).toBe(seed)
  })
})

describe('user._createUser', () => {
  const user = new User()
  it('should be a function', () => {
    expect(user._createUser).toBeFunction()
  })

  it('should add to the DB and return a new user', async () => {
    const newUsername = `ArkCreateUser${Date.now()}`
    let result = await user._createUser(newUsername)
    expect(result).toContainKeys(['address', 'seed', 'username'])
  })
})

describe('user._createNewWallet', () => {
  const user = new User()
  it('should be a function', () => {
    expect(user._createNewWallet).toBeFunction()
  })

  it('should return a wallet', () => {
    const wallet = user._createNewWallet()
    expect(wallet).toContainKeys(['address', 'seed', 'wif'])
  })
})

const newUsername = `ArkTipprTest${Date.now()}`
describe('user.getAddress', () => {
  const user = new User()
  it('should be a function', () => {
    expect(user.getAddress).toBeFunction()
  })

  it('should return an address for a new user', async () => {
    const user = new User()
    let result = await user.getAddress(newUsername)

    expect(result).toBeString()
    expect(result).toHaveLength(34)

    const knownUser = 'arktippr'
    result = await user.getAddress(knownUser)

    expect(result).toBeString()
    expect(result).toHaveLength(34)
  })
})

describe('user.getSeed', () => {
  const user = new User()
  it('should be a function', () => {
    expect(user.getSeed).toBeFunction()
  })

  it('should return a seed for a known user', async () => {
    const user = new User()
    let result = await user.getSeed(newUsername)

    expect(result).toBeString()
  })

  it('should return a seed for a new user', async () => {
    const newUsername = `ArkTipprTest${Date.now()}`
    const user = new User()
    let result = await user.getSeed(newUsername)

    expect(result).toBeString()
  })
})
