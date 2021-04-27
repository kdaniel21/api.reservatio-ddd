import User from '@modules/users/domain/User'
import UserMapper from '@modules/users/mappers/UserMapper'
import { Prisma, PrismaClient, PrismaUser } from '@prisma/client'
import { AppError } from '@shared/core/AppError'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UniqueID from '@shared/domain/UniqueID'
import logger from '@shared/infra/Logger/logger'
import TextUtils from '@shared/utils/TextUtils'
import UserRepository from '../UserRepository'

export default class PrismaUserRepository implements UserRepository<PrismaUser> {
  constructor(private prisma: PrismaClient) {}

  async existsByEmail(email: string): PromiseErrorOr<boolean> {
    try {
      const count = await this.prisma.prismaUser.count({ where: { email } })

      return Result.ok(!!count)
    } catch (err) {
      logger.error(err)

      return Result.fail(AppError.UnexpectedError)
    }
  }

  async findByEmail(email: string): PromiseErrorOr<User> {
    return this.findOne({ email })
  }

  async findByRefreshToken(token: string): PromiseErrorOr<User> {
    const hashedToken = TextUtils.hashText(token)

    return this.findOne({ refreshTokens: { some: { token: hashedToken } } }, { refreshTokens: true })
  }

  async findMany(where: Prisma.PrismaUserWhereInput): PromiseErrorOr<User[]> {
    try {
      const prismaUsers = await this.prisma.prismaUser.findMany({ where })
      const users = prismaUsers.map(prismaUser => UserMapper.toDomain(prismaUser))

      return Result.ok(users)
    } catch (err) {
      logger.error(err)

      return Result.fail(AppError.UnexpectedError)
    }
  }

  async findOne(where: Prisma.PrismaUserWhereInput, include?: Prisma.PrismaUserInclude): PromiseErrorOr<User> {
    try {
      const prismaUser = await this.prisma.prismaUser.findFirst({ where, include })
      if (!prismaUser) return Result.fail()

      const user = UserMapper.toDomain(prismaUser)
      return Result.ok(user)
    } catch (err) {
      logger.error(err)

      return Result.fail(AppError.UnexpectedError)
    }
  }

  async findById(id: UniqueID, include?: Prisma.PrismaUserInclude): PromiseErrorOr<User> {
    return this.findOne({ id: id.toString() }, include)
  }

  async save(user: User): PromiseErrorOr {
    try {
      const { refreshTokens, ...userObject } = await UserMapper.toObject(user)

      await this.prisma.prismaUser.upsert({
        create: userObject,
        update: userObject,
        where: { id: user.userId.toString() },
      })
      return Result.ok()
    } catch (err) {
      logger.error(err)

      return Result.fail(AppError.UnexpectedError)
    }
  }
}
