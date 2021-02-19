import UniqueID from '@shared/domain/UniqueID'
import logger from '@shared/infra/Logger/logger'
import User from '../domain/User'
import UserEmail from '../domain/UserEmail'
import UserName from '../domain/UserName'
import UserPassword from '../domain/UserPassword'
import UserDto from '../DTOs/UserDto'
import BaseMapper from '@shared/infra/BaseMapper'

export default class UserMapper implements BaseMapper<User> {
  static toDto(user: User): UserDto {
    return {
      name: user.name.value,
      email: user.email.value,
      isEmailConfirmed: user.isEmailConfirmed,
      isAdmin: user.isAdmin,
      isDeleted: user.isDeleted,
    }
  }

  static toDomain(raw: any): User {
    const emailOrError = UserEmail.create(raw.email)
    const nameOrError = UserName.create(raw.name)
    const passwordOrError = UserPassword.create({ password: raw.password, isHashed: true })

    const userOrError = User.create(
      {
        email: emailOrError.value,
        name: nameOrError.value,
        password: passwordOrError.value,
        isEmailConfirmed: raw.isEmailConfirmed,
        isDeleted: raw.isDeleted,
        isAdmin: raw.isAdmin,
      },
      new UniqueID(raw.id)
    )

    if (userOrError.isFailure()) logger.error(userOrError.error.error.message)

    return userOrError.value
  }
}
