"use client";

import {
  IExpenseCategory,
  IExpenseProps,
  IPaymentMethod,
  IRecurrenceType,
} from "@/types/interface";
import { useEffect, useState } from "react";

interface IExpensePageProps {
  onClose: () => void;
}

const ExpensePage: React.FC<IExpensePageProps>= () => {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState<IExpenseProps>({
    id: 0,
    description: "",
    amount: 0,
    entry_date: "",
    expense_category_id: 0,
    expenseCategory: {
      id: 0,
      name: "",
    },
    payment_method_id: 0,
    paymentMethod: {
      id: 0,
      name: "",
    },
    recurrence_type_id: 0,
    recurrenceType: {
      id: 0,
      name: "",
    },
    due_date_recurrence: "",
    recurrenceExpense: [],
    installment: 0,
    installmentExpense: [],
    status: false,
  });
  // Estado para armazenar as despesas criadas
  // const [expenses, setExpenses] = useState<IExpenseProps[]>([]);
  const [categories, setCategories] = useState<IExpenseCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [recurrenceTypes, setRecurrenceTypes] = useState<IRecurrenceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para lidar com a mudança dos dados do formulário
  function handleChangeFormData(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]:
        name === "amount" ||
        name === "expense_category_id" ||
        name === "payment_method_id" ||
        name === "recurrence_type_id" ||
        name === "installment"
          ? Number(value)
          : value,
    }));
  }

  function firstLetterFirstWordCapitalized(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value.charAt(0).toUpperCase() + value.slice(1),
    }));
  }

  // Função para lidar com o envio dos dados do formulário
  async function handleSubmitFormData(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    // Simula uma requisição assíncrona
    setTimeout(async () => {
      // Tenta criar uma nova despesa no banco de dados
      try {
        console.log("Dados enviados:", formData);
        const response = await fetch("/api/expense", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        // Armazena os dados da resposta da requisição
        const data = await response.json();

        // Limpa os campos do formulário após o envio dos dados
        setFormData((formData) => ({
          ...formData,
          description: "",
          amount: 0,
          due_date: "",
          expense_category_id: 0,
          payment_method_id: 0,
          recurrence_type_id: 0,
          due_date_recurrence: "",
          installment: 0,
          status: false,
        }));

        // Se a resposta for bem-sucedida, adiciona a nova despesa ao estado de despesas
        if (response.ok) {
          fetchCategories();
          fetchPaymentMethods();
          fetchRecurrenceTypes();
          // fetchExpenses();
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Erro ao enviar dados:", error);
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  }

  // Função para buscar as categorias de despesa no banco de dados
  async function fetchCategories() {
    try {
      const response = await fetch("/api/category");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }

  async function fetchPaymentMethods() {
    try {
      const response = await fetch("/api/paymentMethod");
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Erro ao buscar métodos de pagamento:", error);
    }
  }

  async function fetchRecurrenceTypes() {
    try {
      const response = await fetch("/api/recurrenceType");
      const data = await response.json();
      setRecurrenceTypes(data);
    } catch (error) {
      console.error("Erro ao buscar tipos de recorrência:", error);
    }
  }

  // async function fetchExpenses() {
  //   try {
  //     const response = await fetch("/api/expense");
  //     const data = await response.json();

  //     if (Array.isArray(data.expenses)) {
  //       setExpenses(data.expenses);
  //     } else {
  //       console.error("Erro: dados retornados não são um array");
  //     }
  //   } catch (error) {
  //     console.error("Erro ao buscar despesas:", error);
  //   }
  // }

  useEffect(() => {
    fetchCategories();
    fetchPaymentMethods();
    fetchRecurrenceTypes();
    // fetchExpenses();
  }, []);

  // Renderização do componente de despesas
  return (
    <div className="p-4">
      {/* h1 */}
      <h1 className="text-2xl font-bold mb-4">Despesas</h1>

      <form onSubmit={handleSubmitFormData} className="space-y-4">
        {/* description */}
        <label className="block">
          Descrição:
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={(e) => {
              handleChangeFormData(e);
              firstLetterFirstWordCapitalized(e);
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </label>
        {/* amount */}
        <label className="block">
          Valor:
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChangeFormData}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </label>
        {/* due_date */}
        <label className="block">
          Data de entrada:
          <input
            type="date"
            name="due_date"
            value={
              formData.entry_date instanceof Date
                ? formData.entry_date.toISOString().split("T")[0]
                : formData.entry_date
            }
            onChange={handleChangeFormData}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </label>

        {/* expense_category_id */}
        <label className="block">
          Categoria:
          <select
            name="expense_category_id"
            value={formData.expense_category_id}
            onChange={handleChangeFormData}
            onClick={fetchCategories}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value=""></option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {/* payment_method_id */}
        <label className="block">
          Método de pagamento:
          <select
            name="payment_method_id"
            value={formData.payment_method_id}
            onChange={handleChangeFormData}
            onClick={fetchPaymentMethods}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value=""></option>
            {paymentMethods.map((paymentMethod) => (
              <option key={paymentMethod.id} value={paymentMethod.id}>
                {paymentMethod.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            Selecione uma forma de pagamento
          </span>
        </label>

        {/* recurrence_type_id */}
        <label className="block">
          Tipo de recorrência:
          <select
            name="recurrence_type_id"
            value={formData.recurrence_type_id}
            onChange={handleChangeFormData}
            onClick={fetchRecurrenceTypes}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value=""></option>
            {recurrenceTypes.map((recurrenceType) => (
              <option key={recurrenceType.id} value={recurrenceType.id}>
                {recurrenceType.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            Selecione um tipo de recorrência
          </span>
        </label>

        {/* due date recurrence */}
        <label className="block">
          Data de vencimento da recorrência:
          <input
            type="date"
            name="due_date_recurrence"
            value={
              formData.due_date_recurrence instanceof Date
                ? formData.due_date_recurrence.toISOString().split("T")[0]
                : formData.due_date_recurrence
            }
            onChange={handleChangeFormData}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </label>

        {/* installment */}
        <label className="block">
          Número de parcelas:
          <input
            type="number"
            name="installment"
            value={formData.installment}
            onChange={handleChangeFormData}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </label>
        {/* button submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {/* Lista de despesas
      <ul className="mt-6 space-y-4">
        {Array.isArray(expenses) &&
          expenses.map((expense) => (
            <li
              key={expense.id}
              className="border border-gray-300 rounded-md p-4"
            >
              <p>
                <strong>Descrição:</strong> {expense.description}
              </p>
              <p>
                <strong>Valor:</strong> {expense.amount}
              </p>

              <p>
                <strong>Data de entrada:</strong>{" "}
                {new Date(expense.entry_date).toLocaleDateString("pt-BR")}
              </p>

              <p>
                <strong>Categoria:</strong> {expense.expenseCategory.name}
              </p>
              <p>
                <strong>Método de pagamento:</strong>{" "}
                {expense.paymentMethod.name}
              </p>
              <p>
                <strong>Tipo de recorrência:</strong>{" "}
                {expense.recurrenceType.name}
              </p>
              <p>
                <strong>Data de vencimento da recorrência:</strong>{" "}
                {expense.due_date_recurrence ? new Date(expense.due_date_recurrence).toLocaleDateString("pt-BR") : "N/A"}
              </p>
              <p>
                <strong>Parcelas:</strong> {expense.installment}
              </p>
            </li>
          ))}
      </ul> */}
    </div>
  );
}

export default ExpensePage;
