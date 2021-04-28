const { PrismaClient } = require('.prisma/client')

module.exports = () => {
  const prisma = new PrismaClient()

  const databaseUrl = process.env.DATABASE_URL
  const schema = databaseUrl.split('schema=')[1]

  const dropSchema = prisma.$executeRaw(`drop schema if exists "${schema}" cascade`)
  const disconnectPrismaClient = prisma.$disconnect()

  return Promise.all([dropSchema, disconnectPrismaClient])
}
