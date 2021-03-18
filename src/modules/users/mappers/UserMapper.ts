import UniqueID from '@shared/domain/UniqueID'
import BaseMapper from '@shared/infra/BaseMapper'
import User from '../domain/User'
import UserEmail from '../domain/UserEmail'
import UserName from '../domain/UserName'
import UserPassword from '../domain/UserPassword'
import UserDto from '../DTOs/UserDto'
import logger from '@shared/infra/Logger/logger'
import RefreshTokenMapper from './RefreshTokenMapper'
import UserRefreshToken from '../domain/UserRefreshToken'
import UserPasswordResetToken from '../domain/UserPasswordResetToken'
import { Result } from '@shared/core/Result'
import UserRole from '../domain/UserRole'

export default class UserMapper implements BaseMapper<User> {
  static toDto(user: User): UserDto {
    return {
      name: user.name.value,
      email: user.email.value,
      isEmailConfirmed: user.isEmailConfirmed,
      role: user.role,
    }
  }

  static toDomain(raw: any): User {
    const emailOrError = UserEmail.create(raw.email)
    const nameOrError = UserName.create(raw.name)
    const passwordOrError = UserPassword.create({ password: raw.password, isHashed: true })
    const passwordResetTokenOrError = UserPasswordResetToken.create(
      {
        token: raw.passwordResetToken,
        expiresAt: raw.passwordResetTokenExpiresAt,
      },
      new UniqueID()
    )

    const combinedResult = Result.combine([
      emailOrError,
      nameOrError,
      passwordResetTokenOrError,
      passwordOrError,
    ])
    if (combinedResult.isFailure()) logger.error(combinedResult.error.error.message)

    const id = raw.id ? new UniqueID(raw.id) : null

    let refreshTokens: UserRefreshToken[] = []
    if (raw.refreshTokens) {
      refreshTokens = raw.refreshTokens.map((rawRefreshToken: any) =>
        RefreshTokenMapper.toDomain(rawRefreshToken)
      )
    }

    const userOrError = User.create(
      {
        email: emailOrError.value,
        name: nameOrError.value,
        password: passwordOrError.value,
        isEmailConfirmed: raw.isEmailConfirmed,
        isDeleted: raw.isDeleted,
        role: raw.role as UserRole,
        refreshTokens,
        passwordResetToken: passwordResetTokenOrError.isFailure()
          ? undefined
          : passwordResetTokenOrError.value,
      },
      id
    )

    if (userOrError.isFailure()) logger.error(userOrError.error.error.message)

    return userOrError.value
  }

  static async toObject(user: User) {
    const { isDeleted, isEmailConfirmed } = user

    const refreshTokens = user.refreshTokens.map(refreshToken =>
      RefreshTokenMapper.toObject(refreshToken)
    )

    return {
      id: user.userId.toString(),
      name: user.name.value,
      email: user.email.value,
      role: user.role,
      isDeleted,
      isEmailConfirmed,
      password: await user.password.getHashedValue(),
      passwordResetToken: user.passwordResetToken?.hashedToken || null,
      passwordResetTokenExpiresAt: user.passwordResetToken?.expiresAt || null,
      refreshTokens,
    }
  }
}
