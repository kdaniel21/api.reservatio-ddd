const crypto = require('crypto')
const { PrismaClient, prisma } = require('@prisma/client')
const util = require('util')
const path = require('app-root-path')
const exec = util.promisify(require('child_process').exec)

const prismaBinary = `${path}/node_modules/.bin/prisma`

const databaseUrl = 'postgresql://postgres:postgres@localhost:5432/reservatio'
process.env.DATABASE_URL = databaseUrl

module.exports = async () => {
  const prisma = new PrismaClient()

  const schema = `test_${crypto.randomBytes(16).toString('hex').toLowerCase()}`
  await prisma.$executeRaw(`create schema if not exists "${schema}"`)

  const url = `${databaseUrl}?schema=${schema}`
  process.env.DATABASE_URL = url

  const pushSchemaChanges = exec(`${prismaBinary} db push --preview-feature`)
  const disconnectPrismaClient = prisma.$disconnect

  return Promise.all([pushSchemaChanges, disconnectPrismaClient])
}
