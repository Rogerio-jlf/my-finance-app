/*
  Warnings:

  - You are about to drop the column `recurrence_due_date` on the `expenses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "recurrence_due_date",
ADD COLUMN     "due_date_recurrence" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
