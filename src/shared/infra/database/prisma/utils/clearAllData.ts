import prisma from '../prisma'

export default async () => {
  const databaseUrl = process.env.DATABASE_URL
  const dbSchemaName = databaseUrl.split('schema=')[1]

  for (const { tablename } of await prisma.$queryRaw(
    `SELECT tablename FROM pg_tables WHERE schemaname='${dbSchemaName}'`
  )) {
    await prisma.$queryRaw(`TRUNCATE TABLE \"${dbSchemaName}\".\"${tablename}\" CASCADE;`)
  }
  for (const { relname } of await prisma.$queryRaw(
    `SELECT c.relname FROM pg_class AS c JOIN pg_namespace AS n ON c.relnamespace = n.oid WHERE c.relkind='S' AND n.nspname='${dbSchemaName}';`
  )) {
    await prisma.$queryRaw(`ALTER SEQUENCE \"${dbSchemaName}\".\"${relname}\" RESTART WITH 1;`)
  }
}
