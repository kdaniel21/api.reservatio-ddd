const { PrismaClient, prisma } = require('@prisma/client')
// const util = require('util')
// const path = require('app-root-path')
const clearAllData = require('./clearAllData')
// const exec = util.promisify(require('child_process').exec)

// const prismaBinary = `${path}/node_modules/.bin/prisma`

const databaseUrl = 'postgresql://postgres:postgres@localhost:5432/reservatio'
process.env.DATABASE_URL = databaseUrl

module.exports = async () => {
  const prisma = new PrismaClient()
  const schema = 'test'

  // await prisma.$executeRaw(`drop schema if exists "${schema}" cascade`)
  await prisma.$executeRaw(`create schema if not exists "${schema}"`)

  const url = `${databaseUrl}?schema=${schema}`
  process.env.DATABASE_URL = url

  await clearAllData()
  await prisma.$disconnect()

  // await prisma.$disconnect()

  // const pushSchemaChanges = exec(`${prismaBinary} db push --preview-feature`)
  // const disconnectPrismaClient = prisma.$disconnect
// 
  // return Promise.all([pushSchemaChanges, disconnectPrismaClient])
}
