import User from '@modules/users/domain/User'
import UserMapper from '@modules/users/mappers/UserMapper'
import { PrismaClient, PrismaUser, Prisma } from '@prisma/client'
import RefreshTokenRepository from '../RefreshTokenRepository'
import UserRepository from '../UserRepository'

export default class PrismaUserRepository implements UserRepository<PrismaUser> {
  constructor(
    private prisma: PrismaClient,
    private refreshTokenRepo: RefreshTokenRepository
  ) {}

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.prismaUser.count({ where: { email } })

    return !!count
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email })
  }

  async findMany(where: Prisma.PrismaUserWhereInput): Promise<User[]> {
    const prismaUsers = await this.prisma.prismaUser.findMany({ where })

    return prismaUsers.map(prismaUser => UserMapper.toDomain(prismaUser))
  }

  async findOne(where: Prisma.PrismaUserWhereInput): Promise<User | null> {
    const prismaUser = await this.prisma.prismaUser.findFirst({ where })

    return UserMapper.toDomain(prismaUser)
  }

  async save(user: User): Promise<void> {
    const { refreshTokens, ...userObject } = await UserMapper.toObject(user)

    await this.prisma.prismaUser.upsert({
      create: userObject,
      update: userObject,
      where: { id: user.id.toString() },
    })
  }
}
