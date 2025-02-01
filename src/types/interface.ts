export interface IExpenseCategory {
  id: number;
  name: string;
}

export interface IPaymentMethod {
  id: number;
  name: string;
}

export interface IRecurrenceType {
  id: number;
  name: string;
}

export interface IRecurrenceExpense {
  recurrence_month: number;
  recurrence_year: number;
  recurrence_due_date: Date;
  recurrence_amount: number;
}

export interface IInstallmentExpense {
  installment_number: number;
  installment_amount: number;
  installment_due_date: Date;
}

export interface IExpenseProps {
  id: number;
  description: string;
  amount: number;
  entry_date: Date | string;

  expense_category_id: number;
  expenseCategory: IExpenseCategory;

  payment_method_id: number;
  paymentMethod: IPaymentMethod;

  recurrence_type_id: number;
  recurrenceType: IRecurrenceType;

  due_date?: Date | string;

  recurrenceExpense: IRecurrenceExpense[];

  installment?: number;
  installmentExpense: IInstallmentExpense[];

  status: boolean;
}
