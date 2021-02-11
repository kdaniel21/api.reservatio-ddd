import faker from 'faker'
import InvalidUserNameError from './errors/InvalidUserNameError'
import UserName from './UserName'

describe('UserName value object', () => {
  it('should create a valid UserName object', () => {
    const name = faker.name.findName()

    const userNameOrError = UserName.create(name)

    expect(userNameOrError.isSuccess()).toBe(true)
    expect(userNameOrError.isFailure()).toBe(false)
    expect(userNameOrError.value?.value).toBe(name)
  })

  it('should fail when using a too long name', () => {
    const name = 'This a very very long name that faker cant generate'

    const userNameOrError = UserName.create(name)

    expect(userNameOrError.isSuccess()).toBe(false)
    expect(userNameOrError.isFailure()).toBe(true)
    expect(userNameOrError.error).toBeInstanceOf(InvalidUserNameError)
  })

  it('should fail when passing in an empty string', () => {
    const name = ''

    const userNameOrError = UserName.create(name)

    expect(userNameOrError.isSuccess()).toBe(false)
    expect(userNameOrError.isFailure()).toBe(true)
    expect(userNameOrError.error).toBeInstanceOf(InvalidUserNameError)
  })
})
