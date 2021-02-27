import DomainEvents from '@shared/domain/events/DomainEvents'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '../prisma'

const actionsToSkip = ['findUnique', 'findFirst', 'findMany', 'queryRaw', 'aggregate', 'count']

prisma.$use(async (params, next) => {
  const result = await next(params)
  if (!result || actionsToSkip.includes(params.action)) return result

  const id = new UniqueID(result.id)
  DomainEvents.dispatchEventsForAggregate(id)

  return result
})
