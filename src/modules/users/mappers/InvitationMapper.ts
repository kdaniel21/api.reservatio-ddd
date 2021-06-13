import { Result } from '@shared/core/Result'
import UniqueID from '@shared/domain/UniqueID'
import BaseMapper from '@shared/infra/BaseMapper'
import logger from '@shared/infra/Logger/logger'
import { Invitation } from '../domain/Invitation'
import User from '../domain/User'
import UserEmail from '../domain/UserEmail'
import InvitationDto from '../DTOs/InvitationDto'
import UserMapper from './UserMapper'

export default class InvitationMapper implements BaseMapper<Invitation> {
  static toDto(invitation: Invitation): InvitationDto {
    return {
      id: invitation.id.toString(),
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      emailAddress: invitation.emailAddress.value,
      isActive: invitation.props.isActive,
      inviter: UserMapper.toDto(invitation.inviter),
    }
  }

  static toObject(invitation: Invitation) {
    return {
      id: invitation.id.toString(),
      token: invitation.hashedToken,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
      emailAddress: invitation.emailAddress.value,
      isActive: invitation.props.isActive,
      inviterId: invitation.inviter.id.toString(),
    }
  }

  static toDomain(raw: any): Invitation {
    const inviter = UserMapper.toDomain(raw.inviter)
    const emailOrError = UserEmail.create(raw.emailAddress)

    const combinedResult = Result.combine([emailOrError])
    if (combinedResult.isFailure()) logger.error(`Error while mapping to Invitation domain: ${combinedResult.error}`)

    const invitationOrError = Invitation.create(
      {
        token: raw.token,
        createdAt: raw.createdAt,
        emailAddress: emailOrError.value,
        inviter,
        isActive: raw.isActive,
        expiresAt: raw.expiresAt,
      },
      new UniqueID(raw.id),
    )

    if (invitationOrError.isFailure()) {
      logger.error(`Error while mapping to Invitation domain: ${invitationOrError.error}`)
      throw new Error()
    }

    return invitationOrError.value
  }
}
