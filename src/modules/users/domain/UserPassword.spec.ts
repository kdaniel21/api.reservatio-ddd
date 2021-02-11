import faker from 'faker'
import UserPassword, { InvalidPasswordError } from './UserPassword'

const validPassword = 'Th1sIsAG00dPassw0rd'

describe('UserPassword Value Object', () => {
  it('should create a valid UserPassword object', () => {
    const password = validPassword

    const userPasswordOrError = UserPassword.create({ password })

    expect(userPasswordOrError.isSuccess()).toBe(true)
    expect(userPasswordOrError.isFailure()).toBe(false)
    expect(userPasswordOrError.value?.value).toBe(password)
  })

  it('should fail when using a too short password', () => {
    const password = 'Fo1'

    const userPasswordOrError = UserPassword.create({ password })

    expect(userPasswordOrError.isSuccess()).toBe(false)
    expect(userPasswordOrError.isFailure()).toBe(true)
    expect(userPasswordOrError.value).toBeInstanceOf(InvalidPasswordError)
  })

  it('should fail when using a too long password', () => {
    const password =
      'RAMNd4zmKT8tmAA496mJJkg6gMCdQawLYxnSZ3J8xCR2ctGB2twe3Q3cYQ265A8jhaPP6bkXVUAc3FAASYD9bwax5TXVKsLH4jdbpyVukWnRJc6PeYYGm5UHqeBjveGvFooBar1122'

    const userPasswordOrError = UserPassword.create({ password })

    expect(userPasswordOrError.isSuccess()).toBe(false)
    expect(userPasswordOrError.isFailure()).toBe(true)
    expect(userPasswordOrError.value).toBeInstanceOf(InvalidPasswordError)
  })

  it('should fail when not using uppercase characters', () => {
    const password = validPassword.toLowerCase()

    const userPasswordOrError = UserPassword.create({ password })

    expect(userPasswordOrError.isSuccess()).toBe(false)
    expect(userPasswordOrError.isFailure()).toBe(true)
    expect(userPasswordOrError.value).toBeInstanceOf(InvalidPasswordError)
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
})
