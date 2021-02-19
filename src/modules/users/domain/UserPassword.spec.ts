import faker from 'faker'
import bcrypt from 'bcrypt'
import { InvalidUserPasswordError } from './errors/InvalidUserPasswordError'
import UserPassword from './UserPassword'
import config from '@config'

const validPassword = 'Th1sIsAG00dPassw0rd'

describe('UserPassword Value Object', () => {
  it('should create a valid UserPassword object', () => {
    const password = validPassword

    const userPasswordOrError = UserPassword.create({ password })

    expect(userPasswordOrError.isSuccess()).toBe(true)
    expect(userPasswordOrError.isFailure()).toBe(false)
    expect(userPasswordOrError.value?.value).toBe(password)
    expect(userPasswordOrError.value?.isHashed).toBe(false)
  })

  it('should fail when using a too short password', () => {
    const password = 'Fo1'

    const userPasswordOrError = UserPassword.create({ password })

    expect(userPasswordOrError.isSuccess()).toBe(false)
    expect(userPasswordOrError.isFailure()).toBe(true)
    expect(userPasswordOrError.error).toBeInstanceOf(InvalidUserPasswordError)
  })

  it('should fail when using a too long password', () => {
    const password =
      'RAMNd4zmKT8tmAA496mJJkg6gMCdQawLYxnSZ3J8xCR2ctGB2twe3Q3cYQ265A8jhaPP6bkXVUAc3FAASYD9bwax5TXVKsLH4jdbpyVukWnRJc6PeYYGm5UHqeBjveGvFooBar1122'

    const userPasswordOrError = UserPassword.create({ password })

    expect(userPasswordOrError.isSuccess()).toBe(false)
    expect(userPasswordOrError.isFailure()).toBe(true)
    expect(userPasswordOrError.error).toBeInstanceOf(InvalidUserPasswordError)
  })

  it('should fail when not using uppercase characters', () => {
    const password = validPassword.toLowerCase()

    const userPasswordOrError = UserPassword.create({ password })

    expect(userPasswordOrError.isSuccess()).toBe(false)
    expect(userPasswordOrError.isFailure()).toBe(true)
    expect(userPasswordOrError.error).toBeInstanceOf(InvalidUserPasswordError)
  })

  it('should give the hash of the password', async () => {
    const password = validPassword
    const userPasswordOrError = UserPassword.create({ password })
    const userPassword = userPasswordOrError.value as UserPassword

    const hashedPassword = await userPassword.getHashedValue()

    expect(hashedPassword).not.toBe(password)
  })

  it('should not re-hash the hashed password', async () => {
    const password = validPassword
    const userPasswordOrError = UserPassword.create({ password, isHashed: true })
    const userPassword = userPasswordOrError.value as UserPassword

    const hashedPassword = await userPassword.getHashedValue()

    expect(hashedPassword).toBe(password)
  })

  it('should validate hashed password successfully against plain-text password', async () => {
    const password = validPassword
    const hashedPassword = await bcrypt.hash(password, config.auth.bcryptSaltRounds)
    const userPassword = UserPassword.create({ password: hashedPassword, isHashed: true })

    const isPasswordMatching = await userPassword.value?.comparePassword(password)

    expect(isPasswordMatching).toBe(true)
  })

  it('should validate plain-text password successfully against plain-text password', async () => {
    const password = validPassword
    const userPassword = UserPassword.create({ password, isHashed: false })

    const isPasswordMatching = await userPassword.value?.comparePassword(password)

    expect(isPasswordMatching).toBe(true)
  })

  it('should fail validation of hashed password against wrong plain-text password', async () => {
    const wrongPassword = faker.internet.password(20)
    const hashedPassword = await bcrypt.hash(validPassword, config.auth.bcryptSaltRounds)
    const userPassword = UserPassword.create({ password: hashedPassword, isHashed: true })

    const isPasswordMatching = await userPassword.value?.comparePassword(wrongPassword)

    expect(isPasswordMatching).toBe(false)
  })
})
