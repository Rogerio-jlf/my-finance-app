"use client";

import {
  IExpenseCategory,
  IExpenseProps,
  IPaymentMethod,
  IRecurrenceType,
} from "@/types/interface";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useEffect, useState } from "react";

import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/pt-br";
import dayjs from "dayjs";

interface IExpensePageProps {
  onClose: () => void;
}

const ExpensePage: React.FC<IExpensePageProps> = () => {
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
    due_date: "",
    recurrenceExpense: [],
    installment: 1,
    installmentExpense: [],
    status: false,
  });
  // Estado para armazenar as despesas criadas
  // const [expenses, setExpenses] = useState<IExpenseProps[]>([]);
  const [categories, setCategories] = useState<IExpenseCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [recurrenceTypes, setRecurrenceTypes] = useState<IRecurrenceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formattedAmount, setFormattedAmount] = useState("");
  const [openRegisterDialogSuccess, setOpenRegisterDialogSuccess] =
    useState(false);

  // Função para lidar com a mudança dos dados do formulário
  function handleChangeFormData(
    event:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | SelectChangeEvent<number>
  ) {
    // Verifica se o evento é de um campo de seleção
    const { name, value } = event.target;
    // Atualiza o estado do formulário com os novos dados
    setFormData((prevState) => ({
      ...prevState,
      [name]:
        name === "description" ||
        name === "amount" ||
        name === "expense_category_id" ||
        name === "payment_method_id" ||
        name === "recurrence_type_id" ||
        name === "installment"
          ? Number(value)
          : value,
    }));
  }

  // Função para tornar a 1º letra da 1º palavra em maiúscula
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
    // Previne o comportamento padrão do formulário
    event.preventDefault();

    // Verifica se o formulário está em processo de envio
    setIsLoading(true);

    // Simula uma requisição assíncrona
    setTimeout(async () => {
      // Tenta criar uma nova despesa no banco de dados
      try {
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
          entry_date: "",
          expense_category_id: 0,
          payment_method_id: 0,
          recurrence_type_id: 0,
          due_date: "",
          installment: 1,
          status: false,
        }));

        setFormattedAmount("");

        // Se a resposta for bem-sucedida, adiciona a nova despesa ao estado de despesas
        if (response.ok) {
          fetchCategories();
          fetchPaymentMethods();
          fetchRecurrenceTypes();
          handleRegisterDialogSuccess();
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

  // Função para buscar as categorias no banco de dados
  async function fetchCategories() {
    try {
      const response = await fetch("/api/category");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }

  // Função para buscar os métodos de pagamento no banco de dados
  async function fetchPaymentMethods() {
    try {
      const response = await fetch("/api/paymentMethod");
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Erro ao buscar métodos de pagamento:", error);
    }
  }

  // Função para buscar os tipos de recorrência no banco de dados
  async function fetchRecurrenceTypes() {
    try {
      const response = await fetch("/api/recurrenceType");
      const data = await response.json();
      setRecurrenceTypes(data);
    } catch (error) {
      console.error("Erro ao buscar tipos de recorrência:", error);
    }
  }

  // Efeitos colaterais
  useEffect(() => {
    fetchCategories();
    fetchPaymentMethods();
    fetchRecurrenceTypes();
  }, []);

  // Função para formatar o valor da despesa em moeda brasileira
  function handleFormatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Função para lidar com a mudança do valor da despesa no formulário
  function handleChangeAmount(event: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = event.target.value.replace(/\D/g, "");
    const numericValue = Number(rawValue) / 100;

    setFormData((prev) => ({
      ...prev,
      amount: numericValue,
    }));

    setFormattedAmount(handleFormatCurrency(numericValue));
  }

  // Função para exibir o diálogo de sucesso após o cadastro da despesa
  function handleRegisterDialogSuccess() {
    setOpenRegisterDialogSuccess(true);
  }

  // Renderização do componente de despesas
  return (
    <div className="mt-20 p-10 max-w-2xl mx-auto bg-gradient-to-r from-teal-100 to-teal-50 shadow-2xl rounded-3xl">
      {/* TÍTULO */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center">
        Despesas
      </h1>

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmitFormData} className="space-y-8">
        {/* DESCRIÇÃO */}
        <TextField
          type="text"
          name="description"
          variant="outlined"
          label="Descrição"
          value={formData.description}
          onChange={firstLetterFirstWordCapitalized}
          className="w-full"
        />

        {/* VALOR */}
        <TextField
          type="text"
          name="amount"
          variant="outlined"
          label="Valor"
          value={formattedAmount}
          onChange={handleChangeAmount}
          className="w-full"
        />

        {/* DATA ENTRADA */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <DemoContainer components={["DatePicker"]}>
            <DatePicker
              value={
                formData.entry_date
                  ? dayjs(formData.entry_date, "DD/MM/YYYY")
                  : null
              }
              onChange={(newValue) => {
                setFormData((prevState) => ({
                  ...prevState,
                  entry_date: newValue ? newValue.format("DD/MM/YYYY") : "",
                }));
              }}
              format="DD/MM/YYYY"
              className="w-full"
              slotProps={{
                textField: {
                  placeholder: "Data de Entrada",
                },
                popper: {
                  className: "z-50",
                },
                calendarHeader: {
                  className: "bg-black text-white font-bold p-2 rounded-lg mb-2 shadow-3xl z-50 text-center w-full text-lg transition duration-200 ease-in-out",
                },
                nextIconButton: {
                  className: "text-white",
                },
                previousIconButton: {
                  className: "text-white",
                },
                desktopPaper: {
                  className: "rounded-lg p-3 z-50 shadow-3xl",
                },
                monthButton: {
                  className: "hover:bg-teal-600 rounded-lg transition duration-200 ease-in-out cursor-pointer p-2 text-center text-lg",
                },
                day: {
                  className:
                    "hover:bg-teal-600 rounded-lg transition duration-200 ease-in-out cursor-pointer p-2 text-center text-lg",
                },
              }}
            />
          </DemoContainer>
        </LocalizationProvider>

        {/* CATEGORIA */}
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Categoria</InputLabel>
          <Select
            name="expense_category_id"
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Categoria"
            value={formData.expense_category_id || ""}
            onChange={handleChangeFormData}
            onClick={fetchCategories}
            className="w-full"
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* FORMA PAGAMENTO */}
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">
            Forma de Pagamento
          </InputLabel>
          <Select
            name="payment_method_id"
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Selecione uma Forma de Pagamento"
            value={formData.payment_method_id || ""}
            onChange={handleChangeFormData}
            onClick={fetchPaymentMethods}
            className="w-full"
          >
            {paymentMethods.map((paymentMethod) => (
              <MenuItem key={paymentMethod.id} value={paymentMethod.id}>
                {paymentMethod.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* TIPO RECORRÊNCIA */}
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">
            É uma despesa...
          </InputLabel>
          <Select
            id="demo-simple-select"
            name="recurrence_type_id"
            labelId="demo-simple-select-label"
            label="É uma despesa..."
            value={formData.recurrence_type_id || ""}
            onChange={handleChangeFormData}
            onClick={fetchRecurrenceTypes}
            className="w-full"
          >
            {recurrenceTypes.map((recurrenceType) => (
              <MenuItem key={recurrenceType.id} value={recurrenceType.id}>
                {recurrenceType.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* DATA VENCIMENTO */}
        {(formData.recurrence_type_id === 1 ||
          formData.recurrence_type_id === 3) && (
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pt-br"
          >
            <DatePicker
              value={
                formData.due_date
                  ? dayjs(formData.due_date, "DD/MM/YYYY")
                  : null
              }
              onChange={(newValue) => {
                setFormData((prevState) => ({
                  ...prevState,
                  due_date: newValue ? newValue.format("DD/MM/YYYY") : "",
                }));
              }}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  placeholder: "Selecione a data de vencimento",
                },
              }}
              className="w-full"
            />
          </LocalizationProvider>
        )}

        {/* NÚMERO DE PARCELAS */}
        {formData.recurrence_type_id === 3 && (
          <TextField
            type="number"
            name="installment"
            variant="outlined"
            label="Número de Parcelas"
            value={formData.installment}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < 0) return;
              handleChangeFormData(e);
            }}
            className="w-full"
            inputProps={{ min: 1 }}
          />
        )}

        {/* BOTÃO ENVIAR */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-8 w-full flex items-center justify-center gap-3 bg-teal-500 text-white py-3 px-6 rounded-xl font-bold text-lg shadow-md 
            transition-transform duration-200 hover:bg-teal-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </>
          ) : (
            "Enviar"
          )}
        </button>
      </form>

      {/* DIALOGO SUCESSO CADASTRAR */}
      <Dialog
        open={openRegisterDialogSuccess}
        onClose={() => setOpenRegisterDialogSuccess(false)}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
        className="flex items-center justify-center"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center border-t-4 border-green-500">
          {/* DIÁLOGO TÍTULO */}
          <DialogTitle
            id="success-dialog-title"
            className="text-2xl text-green-600 font-bold italic"
          >
            🎉 SUCESSO!
          </DialogTitle>

          {/* DIÁLOGO MENSAGEM */}
          <DialogContent>
            <DialogContentText
              id="success-dialog-description"
              className="text-lg text-gray-700 font-medium mt-2"
            >
              Despesa cadastrada com sucesso!
            </DialogContentText>
          </DialogContent>

          {/* DIÁLOGO BOTÃO OK */}
          <DialogActions className="mt-4 flex justify-center">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setOpenRegisterDialogSuccess(false);
              }}
              className="bg-green-500 hover:bg-green-600 text-white text-md font-semibold italic py-2 px-6 rounded-lg shadow-md transition-all duration-200 active:scale-95"
              autoFocus
            >
              Ok, Entendi!
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default ExpensePage;
