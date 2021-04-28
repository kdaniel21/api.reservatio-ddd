/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_confirmation_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens.token_unique" ON "refresh_tokens"("token");
