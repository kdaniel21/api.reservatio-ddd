import User from '@modules/users/domain/User'
import UserMapper from '@modules/users/mappers/UserMapper'
import { Prisma, PrismaClient, PrismaUser } from '@prisma/client'
import TextUtils from '@shared/utils/TextUtils'
import UserRepository from '../UserRepository'

export default class PrismaUserRepository implements UserRepository<PrismaUser> {
  constructor(private prisma: PrismaClient) {}

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.prismaUser.count({ where: { email } })

    return !!count
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email })
  }

  async findByRefreshToken(token: string): Promise<User | null> {
    const hashedToken = TextUtils.hashText(token)

    return this.findOne(
      { refreshTokens: { some: { token: hashedToken } } },
      { refreshTokens: true }
    )
  }

  async findMany(where: Prisma.PrismaUserWhereInput): Promise<User[]> {
    const prismaUsers = await this.prisma.prismaUser.findMany({ where })

    return prismaUsers.map(prismaUser => UserMapper.toDomain(prismaUser))
  }

  async findOne(
    where: Prisma.PrismaUserWhereInput,
    include?: Prisma.PrismaUserInclude
  ): Promise<User | null> {
    const prismaUser = await this.prisma.prismaUser.findFirst({
      where,
      include,
    })

    return prismaUser ? UserMapper.toDomain(prismaUser) : null
  }

  async save(user: User): Promise<void> {
    const { refreshTokens, ...userObject } = await UserMapper.toObject(user)

    await this.prisma.prismaUser.upsert({
      create: userObject,
      update: userObject,
      where: { id: user.userId.toString() },
    })
  }
}
