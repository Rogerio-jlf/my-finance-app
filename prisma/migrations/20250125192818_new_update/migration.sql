/*
  Warnings:

  - You are about to drop the `recurring_expenses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "recurring_expenses" DROP CONSTRAINT "recurring_expenses_expense_id_fkey";

-- DropTable
DROP TABLE "recurring_expenses";

-- CreateTable
CREATE TABLE "recurrence_expenses" (
    "id" SERIAL NOT NULL,
    "expense_id" INTEGER NOT NULL,
    "recurrence_month" INTEGER NOT NULL,
    "recurrence_year" INTEGER NOT NULL,
    "recurrence_due_date" TIMESTAMP(3) NOT NULL,
    "recurrence_amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurrence_expenses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recurrence_expenses" ADD CONSTRAINT "recurrence_expenses_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
