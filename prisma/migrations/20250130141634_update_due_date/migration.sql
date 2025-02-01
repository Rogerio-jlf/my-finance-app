/*
  Warnings:

  - You are about to drop the column `due_date_recurrence` on the `expenses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "due_date_recurrence",
ADD COLUMN     "due_date" TIMESTAMP(3),
ALTER COLUMN "created_at" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "entry_date" DROP DEFAULT;
