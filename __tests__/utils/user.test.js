'use strict'

const User = require('../../lib/utils/user.js')

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