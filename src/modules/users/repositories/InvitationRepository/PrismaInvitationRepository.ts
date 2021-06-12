import { PrismaClient, PrismaInvitation } from '.prisma/client'
import { Invitation } from '@modules/users/domain/Invitation'
import InvitationMapper from '@modules/users/mappers/InvitationMapper'
import { AppError } from '@shared/core/AppError'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import logger from '@shared/infra/Logger/logger'
import TextUtils from '@shared/utils/TextUtils'
import InvitationRepository from './InvitationRepository'

export default class PrismaInvitationRepository implements InvitationRepository<PrismaInvitation> {
  constructor(private readonly prisma: PrismaClient) {}

  async findByToken(unHashedToken: string): PromiseErrorOr<Invitation> {
    try {
      const hashedToken = TextUtils.hashText(unHashedToken)

      const prismaInvitation = await this.prisma.prismaInvitation.findUnique({
        where: { token: hashedToken },
        include: { inviter: true },
      })
      if (!prismaInvitation) return Result.fail()

      const invitation = InvitationMapper.toDomain(prismaInvitation)
      return Result.ok(invitation)
    } catch (err) {
      logger.error(err)

      return Result.fail(AppError.UnexpectedError)
    }
  }

  async save(invitation: Invitation): PromiseErrorOr {
    try {
      const invitationObject = InvitationMapper.toObject(invitation)

      await this.prisma.prismaInvitation.upsert({
        create: invitationObject,
        update: invitationObject,
        where: { id: invitation.id.toString() },
      })
      return Result.ok()
    } catch (err) {
      logger.error(err)

      return Result.fail(AppError.UnexpectedError)
    }
  }
}
