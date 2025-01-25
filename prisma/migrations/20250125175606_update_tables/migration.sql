/*
  Warnings:

  - You are about to alter the column `amount` on the `credit_card_expenses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `expenses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `installment_amount` on the `installment_expenses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `installment_amount` on the `installments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `recurrence_amount` on the `recurrence_credit_card_expenses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `recurrence_amount` on the `recurring_expenses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "credit_card_expenses" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "expenses" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "installment_expenses" ALTER COLUMN "installment_amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "installments" ALTER COLUMN "installment_amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "recurrence_credit_card_expenses" ALTER COLUMN "recurrence_amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "recurring_expenses" ALTER COLUMN "recurrence_amount" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "PasswordResetToken";

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_email_key" ON "password_reset_tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
