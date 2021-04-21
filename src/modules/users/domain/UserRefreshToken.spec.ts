import UniqueID from '@shared/domain/UniqueID'
import TextUtils from '@shared/utils/TextUtils'
import faker from 'faker'
import UserRefreshToken, { UserRefreshTokenProps } from './UserRefreshToken'

describe('UserRefreshToken Value Object', () => {
  it('should create a new random refresh token', () => {
    const refreshTokenOrError = UserRefreshToken.create()

    expect(refreshTokenOrError.isSuccess()).toBe(true)
    expect(refreshTokenOrError.value?.token).not.toBeUndefined()
    expect(refreshTokenOrError.value?.expiresAt).not.toBeUndefined()
    expect(refreshTokenOrError.value?.isExpired).toBe(false)
  })

  it('should create a valid UserRefreshToken from existing data', () => {
    const id = new UniqueID()
    const plainTextToken = faker.random.alpha({
      count: UserRefreshToken.tokenOptions.TOKEN_LENGTH,
    })
    const existingToken = {
      token: TextUtils.hashText(plainTextToken),
      expiresAt: faker.date.future(),
      userId: new UniqueID(),
    } as UserRefreshTokenProps

    const refreshTokenOrError = UserRefreshToken.create(existingToken, id)

    expect(refreshTokenOrError.isSuccess()).toBe(true)
    expect(refreshTokenOrError.isFailure()).toBe(false)
    expect(refreshTokenOrError.value?.isExpired).toBe(false)
    expect(refreshTokenOrError.value?.isTokenValid(plainTextToken)).toBe(true)
  })

  it('should create an expired UserRefreshToken from existing data', () => {
    const id = new UniqueID()
    const plainTextToken = faker.random.alpha({
      count: UserRefreshToken.tokenOptions.TOKEN_LENGTH,
    })
    const existingToken = {
      token: TextUtils.hashText(plainTextToken),
      expiresAt: faker.date.past(),
      userId: new UniqueID(),
    } as UserRefreshTokenProps

    const refreshTokenOrError = UserRefreshToken.create(existingToken, id)

    expect(refreshTokenOrError.isSuccess()).toBe(true)
    expect(refreshTokenOrError.isFailure()).toBe(false)
    expect(refreshTokenOrError.value?.isExpired).toBe(true)
    expect(refreshTokenOrError.value?.isTokenValid(existingToken.token)).toBe(false)
  })
})
