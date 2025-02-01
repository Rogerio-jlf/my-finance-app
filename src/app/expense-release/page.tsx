"use client";
import React, { useEffect, useRef, useState } from "react";
import ExpensePage from "../expense/page";
import { IExpenseProps } from "@/types/interface";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
  Tooltip,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

// Interface
interface IExpensePageProps {
  onClose: () => void;
}

// Componente lançamento de despesas gerais
const Release: React.FC<IExpensePageProps> = () => {
  // Estados do componente
  const [expenses, setExpenses] = useState<IExpenseProps[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<IExpenseProps | null>(
    null
  );
  const [filterExpenses, setFilterExpenses] = useState<IExpenseProps[]>([]);
  const [currenthMonth, setCurrenthMonth] = useState<number>(
    new Date().getMonth()
  );
  const [currenthYear, setCurrenthYear] = useState<number>(
    new Date().getFullYear()
  );

  const [expenseModalIsOpen, setExpenseModalIsOpen] = useState(false);
  const [showDropdownRelease, setShowDropdownRelease] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeleteDialogSuccess, setOpenDeleteDialogSuccess] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);

  // Função para buscar todas as despesas no banco de dados
  async function handleFetchExpenses() {
    try {
      const response = await fetch("/api/expense");
      const data = await response.json();
      setExpenses(data.expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  }

  // Efeito para buscar as despesas no banco de dados
  useEffect(() => {
    handleFetchExpenses();
  }, []);

  // Efeito para filtrar as despesas pelo mês/ano selecionado e categoria
  useEffect(() => {
    const expandedExpenses = expenses.flatMap((expense) => {
      const dueDate = expense.due_date
        ? new Date(expense.due_date)
        : new Date();

      // Se for despesa parcelada (parcelamentos)
      if (
        expense.recurrenceType.id === 3 &&
        expense.installmentExpense.length > 0
      ) {
        return expense.installmentExpense.map((installment) => ({
          ...expense,
          due_date: installment.installment_due_date
            ? new Date(installment.installment_due_date).toISOString()
            : new Date().toISOString(),
          installmentNumber: installment.installment_number,
          amount: installment.installment_amount,
        }));
      }

      // Se for despesa recorrente (mensal, semanal, etc.)
      if (expense.recurrenceType.id === 1) {
        const occurrences = [];
        const recurrenceDate = expense.due_date
          ? new Date(expense.due_date)
          : new Date();

        // Criamos instâncias até alcançar o ano necessário (exemplo: até o final de 2026)
        while (recurrenceDate.getFullYear() <= currenthYear + 1) {
          occurrences.push({
            ...expense,
            due_date: recurrenceDate.toISOString(),
            installmentNumber: 0, // Não tem parcelas
          });

          // ------------------------------------------------------------------
          // // Criar instâncias até o final de 2026, por exemplo
          // const endDate = new Date(currenthYear + 2, 0, 1); // Final de 2026, por exemplo

          // // Continuar gerando datas enquanto a data de vencimento for menor ou igual ao fim de 2026
          // while (recurrenceDate < endDate) {
          //   occurrences.push({
          //     ...expense,
          //     due_date: recurrenceDate.toISOString(),
          //     installmentNumber: 0, // Não tem parcelas
          //   });
          // ------------------------------------------------------------------

          // Ajusta a data conforme o tipo de recorrência (mensal)
          recurrenceDate.setMonth(recurrenceDate.getMonth() + 1);
        }

        return occurrences;
      }

      // Se não for parcelada nem recorrente, retorna normalmente
      return [
        { ...expense, due_date: dueDate.toISOString(), installmentNumber: 1 },
      ];
    });

    // Filtra despesas pelo mês/ano selecionado e categoria
    const filtered = expandedExpenses
      .filter((expense) => {
        const dueDate = expense.due_date
          ? new Date(expense.due_date)
          : new Date();
        const isSameMonth =
          dueDate.getMonth() === currenthMonth &&
          dueDate.getFullYear() === currenthYear;

        const isCategoryMatch =
          !selectedCategory ||
          expense.expenseCategory.name === selectedCategory;

        return isSameMonth && isCategoryMatch;
      })
      .sort((a, b) => {
        const dateA = a.due_date ? new Date(a.due_date) : new Date();
        const dateB = b.due_date ? new Date(b.due_date) : new Date();
        return dateA.getTime() - dateB.getTime();
      });

    setFilterExpenses(filtered);
  }, [expenses, currenthMonth, currenthYear, selectedCategory]);

  // Efeito para fechar o dropdown de categorias ao clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCategoriesDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Função para deletar uma despesa do banco de dados
  async function handleDeleteExpense(id: number) {
    try {
      await fetch(`/api/expense/${id}`, {
        method: "DELETE",
      });
      handleFetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  }

  // Função para selecionar a despesa e abrir o modal de confirmação de exclusão
  function handleDeleteClick(expense: IExpenseProps) {
    setSelectedExpense(expense);
    setOpenDeleteDialog(true);
  }

  // Função para confirmar a exclusão da despesa selecionada
  function handleConfirmDelete() {
    if (selectedExpense) {
      handleDeleteExpense(selectedExpense.id);
    }
    setOpenDeleteDialog(false);
    setSelectedExpense(null);
    setOpenDeleteDialogSuccess(true);
  }

  // Função para navegar para o mês anterior
  function handlePreviousMonth() {
    if (currenthMonth === 0) {
      setCurrenthMonth(11);
      setCurrenthYear(currenthYear - 1);
    } else {
      setCurrenthMonth(currenthMonth - 1);
    }
  }

  // Função para navegar para o próximo mês
  function handleNextMonth() {
    if (currenthMonth === 11) {
      setCurrenthMonth(0);
      setCurrenthYear(currenthYear + 1);
    } else {
      setCurrenthMonth(currenthMonth + 1);
    }
  }

  // Array com os meses
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Função para abrir o modal de detalhes da despesa
  function handleOpenModalExpenseDetails(expense: IExpenseProps) {
    setSelectedExpense(expense);
  }

  // Função para fechar o modal de detalhes da despesa
  function handleCloseModalExpenseDetails() {
    setSelectedExpense(null);
  }

  // Função para abrir o modal, para o formulário de despesa
  function handleOpenModalExpenseForm() {
    setExpenseModalIsOpen(true);
  }

  // Função para fechar o modal, para o formulário de despesa
  function handleCloseModalExpenseForm() {
    setExpenseModalIsOpen(false);
  }

  // Função para lidar com o evento de mouse entrar no botão de lançamento
  function handleMouseEnterDropDownRelease() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Cancela o temporizador se o mouse reentrar
    }
    setShowDropdownRelease(true);
  }

  // Função para lidar com o evento de mouse sair do botão de lançamento
  function handleMouseExitDropDownRelease() {
    // Configura o temporizador para fechar o dropdown após 2 segundos
    timeoutRef.current = setTimeout(() => {
      setShowDropdownRelease(false);
    }, 1000);
  }

  const resetToCurrentMonth = () => {
    setCurrenthMonth(new Date().getMonth());
    setCurrenthYear(new Date().getFullYear());
  };

  // RENDERIZAÇÃO COMPONENTE
  return (
    <main className="p-6 bg-slate-200 rounded-lg m-8">
      {/* H1 - H2 */}
      <div className="mb-14">
        <h1 className="text-3xl font-semibold text-center mb-1">LANÇAMENTOS</h1>
        <h2 className="text-xl font-semibold italic text-center">
          DESPESAS GERAIS
        </h2>
      </div>

      {/* BOTÃO NOVO LANÇAMENTO - DROPDOWN - FILTRO CATEGORIA - FILTRO MÊS - MODAL COMPONENTE EXPENSE */}
      <div className="flex flex-row justify-between mb-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-xl font-semibold">Novo Lançamento</span>
          {/* RELEASE BUTTON */}
          <button
            onMouseEnter={handleMouseEnterDropDownRelease}
            onMouseLeave={handleMouseExitDropDownRelease}
            className="p-1 bg-red-500 active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
          >
            <AddIcon className="text-2xl text-white" />
          </button>

          {/* DROPDOWN TIPO LANÇAMENTO */}
          {showDropdownRelease && (
            <div
              className="absolute top-80 left-40 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
              onMouseEnter={handleMouseEnterDropDownRelease}
              onMouseLeave={handleMouseExitDropDownRelease}
            >
              <ul className="space-y-2">
                <li
                  onClick={handleOpenModalExpenseForm}
                  className="p-2 cursor-pointer hover:bg-red-500 active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150 hover:text-white hover:font-semibold"
                >
                  Despesas
                </li>

                <li className="p-2 cursor-pointer hover:bg-red-500 active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150 hover:text-white hover:font-semibold">
                  Despesas Cartão Crédito
                </li>

                <li className="p-2 cursor-pointer hover:bg-red-500 active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150 hover:text-white hover:font-semibold">
                  Receitas
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* FILTRO CATEGORIA */}
        <div className="flex items-center space-x-4 mb-6 flex-1">
          <ul className="flex items-center space-x-4 w-full relative">
            <li
              onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
              className={
                "border p-2 m-7 rounded-lg flex flex-row justify-between bg-white cursor-pointer transition w-full"
              }
            >
              <div className="flex items-center">
                <Tooltip
                  title="Filtro por categoria"
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        fontSize: "14px",
                        backgroundColor: "black",
                        fontFamily: "cursive",
                      },
                    },
                  }}
                >
                  <FilterListIcon className="text-2xl text-black" />
                </Tooltip>
                <span
                  className={`ml-2 ${
                    selectedCategory
                      ? "text-black text-lg font-semibold "
                      : "text-gray-400"
                  }`}
                >
                  {selectedCategory || "Selecione uma categoria..."}
                </span>
              </div>

              {/* BOTÃO LIMPAR FILTRO */}
              {selectedCategory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory(null);
                    setShowCategoriesDropdown(false);
                    handleFetchExpenses();
                  }}
                  className="ml-2 bg-red-500 text-white active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
                >
                  <CloseIcon />
                </button>
              )}
            </li>

            {/* DROPDOWN CATEGORIA */}
            {showCategoriesDropdown && (
              <div
                ref={menuRef}
                className="absolute top-full p-2 left-10 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-96"
              >
                <ul className="space-y-2">
                  {expenses
                    .map((expense) => expense.expenseCategory.name)
                    .filter(
                      (value, index, self) => self.indexOf(value) === index
                    )
                    .map((category) => (
                      <li
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoriesDropdown(false);
                        }}
                        className="p-2 cursor-pointer hover:bg-red-500 active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150 hover:text-white hover:font-semibold"
                      >
                        {category}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </ul>
        </div>

        {/* FILTRO MÊS */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handlePreviousMonth}
            className="p-1 bg-red-500 text-white active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
          >
            <Tooltip
              title="Anterior"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    fontSize: "14px",
                    backgroundColor: "black",
                    fontFamily: "cursive",
                  },
                },
              }}
            >
              <KeyboardDoubleArrowLeftIcon />
            </Tooltip>
          </button>

          <Tooltip
            title="Clique para voltar ao mês atual"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  fontSize: "14px",
                  backgroundColor: "black",
                  fontFamily: "cursive",
                },
              },
            }}
          >
            <p
              onClick={resetToCurrentMonth}
              className="cursor-pointer text-xl font-semibold w-40 text-center"
            >
              {`${monthNames[currenthMonth]}/${currenthYear}`}
            </p>
          </Tooltip>

          <button
            onClick={handleNextMonth}
            className="p-1 bg-red-500 text-white active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
          >
            <Tooltip
              title="Próximo"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    fontSize: "14px",
                    backgroundColor: "black",
                    fontFamily: "cursive",
                  },
                },
              }}
            >
              <KeyboardDoubleArrowRightIcon />
            </Tooltip>
          </button>
        </div>

        {/* MODAL COMPONENTE EXPENSE */}
        <Modal
          open={expenseModalIsOpen}
          onClose={handleCloseModalExpenseForm}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          className="flex items-center justify-center"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <ExpensePage onClose={handleCloseModalExpenseForm} />
          </div>
        </Modal>
      </div>

      {/* LISTA DESPESAS */}
      <ul className="space-y-4">
        {filterExpenses.map((expense) => (
          <div
            key={expense.id}
            className="flex flex-row items-center space-x-4"
          >
            {/* DIA DATA VENCIMENTO RECORRÊNCIA */}
            {expense.recurrenceType.id === 1 && (
              <div className="w-16 text-center">
                <p className="text-3xl font-bold italic text-red-500">
                  {expense.recurrenceExpense.map((recurrence) =>
                    new Date(recurrence.recurrence_due_date).getDate()
                  )}
                </p>
              </div>
            )}

            {/* DIA DATA ENTRADA */}
            {expense.recurrenceType.id === 2 && (
              <div className="w-16 text-center">
                <p className="text-3xl font-bold italic text-red-500">
                  {new Date(expense.entry_date).getDate()}
                </p>
              </div>
            )}

            {/* DIA DATA VENCIMENTO PARCELA */}
            {expense.recurrenceType.id === 3 && (
              <div className="w-16 text-center">
                <p className="text-3xl font-bold italic text-red-500">
                  {[
                    ...new Set(
                      expense.installmentExpense.map((installment) =>
                        new Date(installment.installment_due_date).getDate()
                      )
                    ),
                  ].join(", ")}
                </p>
              </div>
            )}

            {/* DESCRIÇÃO- NÚMERO PARCELA - ICONS - VALOR */}
            <div className="w-full">
              <Tooltip
                title="Clique para ver os detalhes da despesa e para mais ações..."
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      fontSize: "14px",
                      backgroundColor: "black",
                      fontFamily: "cursive",
                    },
                  },
                }}
              >
                <li
                  onClick={() => handleOpenModalExpenseDetails(expense)}
                  className="p-3 rounded-lg flex flex-row bg-white hover:bg-red-300 cursor-pointer transition w-full"
                >
                  {/* DESCRIÇÃO - NÚMERO PARCELA */}
                  <div className="flex-1 min-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    <div className="flex flex-row items-center space-x-4">
                      {/* DESCRIÇÃO */}
                      <p className="text-black font-semibold">
                        {expense.description}
                      </p>

                      {/* NÚMERO PARCELA */}
                      {expense.installmentExpense
                        .filter(
                          (installment) =>
                            new Date(
                              installment.installment_due_date
                            ).getMonth() === currenthMonth &&
                            new Date(
                              installment.installment_due_date
                            ).getFullYear() === currenthYear
                        )
                        .map((installment) => (
                          <p
                            key={installment.installment_number}
                            className="text-black font-semibold"
                          >
                            {`- ${installment.installment_number} / ${expense.installmentExpense.length}`}
                          </p>
                        ))}
                    </div>
                  </div>

                  {/* ICONS */}
                  <div className="w-40 flex justify-center space-x-2">
                    {/* ICON DESPESA */}
                    {expense.recurrenceType.id === 1 ||
                    expense.recurrenceType.id === 2 ||
                    expense.recurrenceType.id === 3 ? (
                      <Tooltip
                        title="Despesa"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              fontSize: "14px",
                              backgroundColor: "black",
                              fontFamily: "cursive",
                            },
                          },
                        }}
                      >
                        <RemoveCircleOutlineIcon className="text-2xl text-black" />
                      </Tooltip>
                    ) : null}

                    {/* ICON DESPESA RECORRENTE */}
                    {expense.recurrenceType.id === 1 ? (
                      <Tooltip
                        title="Recorrente"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              fontSize: "14px",
                              backgroundColor: "black",
                              fontFamily: "cursive",
                            },
                          },
                        }}
                      >
                        <RepeatIcon className="text-2xl text-black" />
                      </Tooltip>
                    ) : null}

                    {/* ICON DESPESA ÚNICA */}
                    {expense.recurrenceType.id === 2 ? (
                      <Tooltip
                        title="Única"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              fontSize: "14px",
                              backgroundColor: "black",
                              fontFamily: "cursive",
                            },
                          },
                        }}
                      >
                        <ShortcutIcon className="text-2xl text-black" />
                      </Tooltip>
                    ) : null}

                    {/* ICON DESPESA PARCELADA */}
                    {expense.recurrenceType.id === 3 ? (
                      <Tooltip
                        title="Parcelada"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              fontSize: "14px",
                              backgroundColor: "black",
                              fontFamily: "cursive",
                            },
                          },
                        }}
                      >
                        <SettingsEthernetIcon className="text-2xl text-black" />
                      </Tooltip>
                    ) : null}
                  </div>

                  {/* VALOR */}
                  <div className="w-32 text-right">
                    {expense.recurrenceType.id === 3 ? (
                      <p className="text-black font-semibold">
                        {`R$ ${new Intl.NumberFormat("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          expense.installmentExpense[0].installment_amount
                        )}`}
                      </p>
                    ) : (
                      <p className="text-black font-semibold">
                        {`R$ ${new Intl.NumberFormat("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(expense.amount)}`}
                      </p>
                    )}
                  </div>
                </li>
              </Tooltip>
            </div>
          </div>
        ))}
      </ul>

      {/* MODAL DETALHE DESPESA RECORRENTE */}
      {selectedExpense && selectedExpense.recurrenceType.id === 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-bold text-center mb-8">
              Despesa Recorrente
            </h2>

            <h3 className="text-xl font-bold mb-2">Detalhes...</h3>

            <p className="mb-2 ml-4">
              <strong className="italic">Descrição:</strong>{" "}
              {selectedExpense.description}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Valor:</strong>{" "}
              {`R$ ${new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(selectedExpense.amount)}`}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Data de entrada:</strong>{" "}
              {new Date(selectedExpense.entry_date).toLocaleDateString("pt-BR")}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Categoria:</strong>{" "}
              {selectedExpense.expenseCategory.name}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Forma de pagamento:</strong>{" "}
              {selectedExpense.paymentMethod.name}
            </p>

            <p className="mb-8 ml-4">
              <strong className="italic">Vence todo dia:</strong>{" "}
              {selectedExpense.due_date
                ? new Date(selectedExpense.due_date).toLocaleDateString("pt-BR")
                : "N/A"}
            </p>

            <div className="flex justify-between">
              {/* BUTTON CLOSE DIALOG */}
              <button
                className="text-xl font-semibold p-2 mt-4 bg-red-500 text-white active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseModalExpenseDetails();
                }}
              >
                Fechar
              </button>

              {/* BUTTON DELETE ICON */}
              <Tooltip
                title="Excluir despesa"
                arrow
                componentsProps={{
                  tooltip: { sx: { fontSize: "14px" } },
                }}
              >
                <DeleteIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(selectedExpense);
                  }}
                  className="cursor-pointer mt-4 text-5xl text-red-500 active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHE DESPESA ÚNICA */}
      {selectedExpense && selectedExpense.recurrenceType.id === 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-bold text-center mb-8">
              Despesa Não Recorrente
            </h2>

            <h3 className="text-xl font-bold mb-2">Detalhes...</h3>

            <p className="mb-2 ml-4">
              <strong className="italic">Descrição:</strong>{" "}
              {selectedExpense.description}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Valor:</strong>{" "}
              {`R$ ${new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(selectedExpense.amount)}`}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Data de entrada:</strong>{" "}
              {new Date(selectedExpense.entry_date).toLocaleDateString("pt-BR")}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Categoria:</strong>{" "}
              {selectedExpense.expenseCategory.name}
            </p>

            <p className="mb-8 ml-4">
              <strong className="italic">Forma de pagamento:</strong>{" "}
              {selectedExpense.paymentMethod.name}
            </p>

            <div className="flex justify-between">
              {/* BUTTON CLOSE DIALOG */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseModalExpenseDetails();
                }}
                className="text-xl font-semibold p-2 mt-4 bg-red-500 text-white active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
              >
                Fechar
              </button>

              {/* BUTTON DELETE ICON */}
              <Tooltip
                title="Excluir despesa"
                arrow
                componentsProps={{
                  tooltip: { sx: { fontSize: "14px" } },
                }}
              >
                <DeleteIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(selectedExpense);
                  }}
                  className="cursor-pointer mt-4 text-5xl text-red-500 active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHE DESPESA PARCELADA */}
      {selectedExpense && selectedExpense.recurrenceType.id === 3 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-bold text-center mb-8">
              Despesa Parcelada
            </h2>

            <h3 className="text-xl font-bold mb-2">Detalhes...</h3>

            <p className="mb-2 ml-4">
              <strong className="italic">Descrição:</strong>{" "}
              {selectedExpense.description}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Valor:</strong>{" "}
              {`R$ ${new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(selectedExpense.amount)}`}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Data de entrada:</strong>{" "}
              {new Date(selectedExpense.entry_date).toLocaleDateString("pt-BR")}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Categoria:</strong>{" "}
              {selectedExpense.expenseCategory.name}
            </p>

            <p className="mb-2 ml-4">
              <strong className="italic">Forma de pagamento:</strong>{" "}
              {selectedExpense.paymentMethod.name}
            </p>

            <div className="space-y-4">
              {selectedExpense.installmentExpense.map((installment) => (
                <div
                  key={installment.installment_number}
                  className="border p-4 rounded-lg shadow-md bg-gray-50"
                >
                  <p className="mb-2 ml-4">
                    <strong className="italic">Parcela:</strong>{" "}
                    {installment.installment_number}
                  </p>

                  <p className="mb-2 ml-4">
                    <strong className="italic">Valor:</strong>{" "}
                    {`R$ ${new Intl.NumberFormat("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(installment.installment_amount)}`}
                  </p>

                  <p className="mb-2 ml-4">
                    <strong className="italic">Data de vencimento:</strong>{" "}
                    {new Date(
                      installment.installment_due_date
                    ).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              {/* BUTTON CLOSE DIALOG */}
              <button
                className="text-xl font-semibold p-2 mt-4 bg-red-500 text-white active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseModalExpenseDetails();
                }}
              >
                Fechar
              </button>

              {/* BUTTON DELETE ICON */}
              <Tooltip
                title="Excluir despesa"
                arrow
                componentsProps={{
                  tooltip: { sx: { fontSize: "14px" } },
                }}
              >
                <DeleteIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(selectedExpense);
                  }}
                  className="cursor-pointer mt-4 text-5xl text-red-500 active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* DIÁLOGO CONFIRMAR DELETE */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle
          id="delete-dialog-title"
          className="text-xl text-red-500 font-semibold italic mb-6"
        >
          {"CONFIRMAR EXCLUSÃO"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            id="delete-dialog-description"
            className="text-lg italic text-red-500 mb-6"
          >
            Tem certeza que deseja excluir a despesa em questão?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDeleteDialog(false);
            }}
            className="bg-blue-500 text-white text-md font-semibold italic p-2 active:scale-90 active:bg-blue-700 rounded-lg transition-all duration-150"
          >
            Cancelar
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmDelete();
            }}
            className="bg-red-500 text-white text-md font-semibold italic p-2 active:scale-90 active:bg-red-700 rounded-lg transition-all duration-150"
            autoFocus
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOGO SUCESSO DELETE */}
      <Dialog
        open={openDeleteDialogSuccess}
        onClose={() => setOpenDeleteDialogSuccess(false)}
        aria-labelledby="delete-success-dialog-title"
        aria-describedby="delete-success-dialog-description"
      >
        <DialogTitle
          id="delete-success-dialog-title"
          className="text-xl text-green-600 font-semibold italic mb-6"
        >
          {"SUCESSO"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            id="delete-success-dialog-description"
            className="text-lg italic text-green-600 mb-6"
          >
            Categoria deletada com sucesso!
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDeleteDialogSuccess(false);
            }}
            className="bg-green-600 text-white text-md font-semibold italic p-2 active:scale-90 active:bg-green-800 rounded-lg transition-all duration-150"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
};

export default Release;
