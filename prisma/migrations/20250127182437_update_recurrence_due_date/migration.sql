/*
  Warnings:

  - You are about to drop the column `due_date` on the `expenses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "due_date",
ADD COLUMN     "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "recurrence_due_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
