/*
  Warnings:

  - You are about to drop the column `recurrence_id` on the `expenses` table. All the data in the column will be lost.
  - Added the required column `recurrence_type_id` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_recurrence_id_fkey";

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "recurrence_id",
ADD COLUMN     "recurrence_type_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recurrence_type_id_fkey" FOREIGN KEY ("recurrence_type_id") REFERENCES "recurrence_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
