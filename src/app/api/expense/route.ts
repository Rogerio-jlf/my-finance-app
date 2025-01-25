import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Define a interface dos campos obrigatórios
export interface IExpense {
  description: string;
  amount: number;
  due_date: Date | string;
  expense_category_id: number;
  payment_method_id: number;
  recurrence_type_id: number;
  installments?: number;
}

// Função para criar uma despesa no banco de dados
export async function POST(req: Request) {
  try {
    // Converte o corpo da requisição para o tipo IExpense
    const body = (await req.json()) as IExpense;

    // Desestrutura os campos obrigatórios
    const {
      description,
      amount,
      due_date,
      expense_category_id,
      payment_method_id,
      recurrence_type_id,
      installments,
    } = body;

    // Verifica se os campos obrigatórios foram preenchidos
    if (
      !description ||
      !amount ||
      !due_date ||
      !expense_category_id ||
      !payment_method_id ||
      !recurrence_type_id
    ) {
      return NextResponse.json(
        { error: "Todos os campos do formulário são obrigatórios." },
        { status: 400 }
      );
    }

    // Função auxiliar para padronizar a data sem timezone
    const normalizeDate = (date: Date | string) => {
      const d = new Date(date);
      return new Date(
        Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 3, 0, 0, 0)
      );
    };

    // Cria e salva a despesa recorrente no banco de dados
    if (recurrence_type_id === 1) {
      const newRecurrenceExpense = await prisma.expense.create({
        data: {
          description,
          amount,
          due_date: normalizeDate(due_date),
          expense_category_id,
          payment_method_id,
          recurrence_type_id,
        },
      });

      // Gera a recorrência para a despesa
      const recurrenceData = [];
      const startDate = new Date(due_date);
      const dueDay = startDate.getDate();

      // Gera as recorrências para os próximos 12 meses
      for (let i = 0; i < 12; i++) {
        const recurrenceMonth = (startDate.getMonth() + i) % 12;
        const recurrenceYear =
          startDate.getFullYear() + Math.floor((startDate.getMonth() + i) / 12);

        // Calcula as datas de vencimento das recorrências
        const recurrenceDueDate = normalizeDate(
          new Date(recurrenceYear, recurrenceMonth, dueDay)
        );

        // Armazena os dados da recorrência no array
        recurrenceData.push({
          expense_id: newRecurrenceExpense.id,
          recurrence_month: recurrenceMonth + 1,
          recurrence_year: recurrenceYear,
          recurrence_due_date: recurrenceDueDate,
          recurrence_amount: amount,
        });
      }

      // Cria a recorrência no banco de dados
      await prisma.recurrenceExpense.createMany({
        data: recurrenceData,
      });

      // Busca a despesa recém-criada com as suas relações
      const expenseRelations = await prisma.expense.findUnique({
        where: { id: newRecurrenceExpense.id },
        include: {
          expenseCategory: {
            select: {
              id: true,
              name: true,
            },
          },
          paymentMethod: {
            select: {
              id: true,
              name: true,
            },
          },
          recurrenceExpense: {
            select: {
              id: true,
              recurrence_month: true,
              recurrence_year: true,
              recurrence_due_date: true,
              recurrence_amount: true,
            },
          },
        },
      });

      // Retorna a despesa criada com uma mensagem de sucesso e status 201
      return NextResponse.json(
        { message: "Despesa criada com sucesso!", expense: expenseRelations },
        { status: 201 }
      );
      // Cria e salva a despesa não recorrente no banco de dados
    } else if (recurrence_type_id === 2) {
      // Cria a despesa não recorrente no banco de dados
      const newNotRecurrenceExpense = await prisma.expense.create({
        data: {
          description,
          amount,
          due_date: normalizeDate(due_date),
          expense_category_id,
          payment_method_id,
          recurrence_type_id,
        },
      });

      // Busca a despesa recém-criada com as suas relações
      const expenseRelations = await prisma.expense.findUnique({
        where: { id: newNotRecurrenceExpense.id },
        include: {
          expenseCategory: {
            select: {
              id: true,
              name: true,
            },
          },
          paymentMethod: {
            select: {
              id: true,
              name: true,
            },
          },
          recurrenceExpense: {
            select: {
              id: true,
            },
          },
        },
      });

      // Retorna a despesa criada com uma mensagem de sucesso e status 201
      return NextResponse.json(
        { message: "Despesa criada com sucesso!", expense: expenseRelations },
        { status: 201 }
      );
      // Cria e salva a despesa parcelada no banco de dados
    } else if (recurrence_type_id === 3 && installments && installments > 1) {
      // Cria a despesa parcelada no banco de dados
      const newInstallmentsExpense = await prisma.expense.create({
        data: {
          description,
          amount,
          due_date: normalizeDate(due_date),
          expense_category_id,
          payment_method_id,
          recurrence_type_id,
          installments,
        },
      });

      // Gera as parcelas da despesa
      const purchaseDate = new Date(due_date);
      const installmentData = [];
      const installmentAmount = amount / installments;

      // Gera as parcelas com base no número informado
      for (let i = 0; i < installments; i++) {
        let installmentMonth = purchaseDate.getMonth() + i;
        let installmentYear = purchaseDate.getFullYear();

        // Ajusta o mês para o próximo ano, se necessário
        if (installmentMonth > 11) {
          installmentMonth = installmentMonth % 12;
          installmentYear++;
        }

        // Calcula a data de vencimento da parcela
        const dueDate = normalizeDate(
          new Date(
            installmentYear,
            installmentMonth,
            new Date(due_date).getDate()
          )
        );

        // Armazena os dados da parcela no array
        installmentData.push({
          expense_id: 0,
          installment_number: i + 1,
          installment_amount: installmentAmount,
          installment_due_date: dueDate,
        });
      }

      // Atualiza o ID da despesa nas parcelas
      installmentData.forEach(
        (inst) => (inst.expense_id = newInstallmentsExpense.id)
      );

      // Insere as parcelas no banco de dados
      await prisma.installmentExpense.createMany({ data: installmentData });

      // Busca a despesa recém-criada com as suas relações
      const expenseWithRelations = await prisma.expense.findUnique({
        where: { id: newInstallmentsExpense.id },
        include: {
          expenseCategory: {
            select: {
              id: true,
              name: true,
            },
          },

          paymentMethod: {
            select: {
              id: true,
              name: true,
            },
          },
          recurrenceExpense: {
            select: {
              id: true,
            },
          },
          installmentExpense: {
            select: {
              id: true,
              installment_number: true,
              installment_amount: true,
              installment_due_date: true,
            },
          },
        },
      });

      // Retorna a despesa criada com uma mensagem de sucesso e status 201
      return NextResponse.json(
        {
          message: "Despesa criada com sucesso!",
          expense: expenseWithRelations,
        },
        { status: 201 }
      );
      // Retorna uma mensagem de erro para o tipo de recorrência inválido
    } else {
      return NextResponse.json(
        {
          error: "Tipo de recorrência inválido ou número de parcelas inválido.",
        },
        { status: 400 }
      );
    }
    // Retorna uma mensagem de erro para campos obrigatórios não preenchidos
  } catch (error) {
    console.error("Erro ao tentar criar despesa:", error);
    // Retorna uma mensagem de erro genérica
    return NextResponse.json(
      { error: "Erro ao tentar criar despesa." },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------------------

// Função para buscar todas as despesas no banco de dados
export async function GET() {
  // Tenta buscar as despesas no banco de dados
  try {
    const expenses = await prisma.expense.findMany({
      select: {
        id: true,
        description: true,
        amount: true,
        due_date: true,
        expenseCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        paymentMethod: {
          select: {
            id: true,
            name: true,
          },
        },
        recurrenceExpense: {
          select: {
            id: true,
            recurrence_month: true,
            recurrence_year: true,
            recurrence_due_date: true,
            recurrence_amount: true,
          },
        },
        installmentExpense: {
          select: {
            id: true,
            installment_number: true,
            installment_amount: true,
            installment_due_date: true,
          },
        },
      },
    });

    // Retorna as despesas encontradas com status 200
    return NextResponse.json({ expenses }, { status: 200 });
    // Retorna uma mensagem de erro genérica
  } catch (error) {
    console.error("Erro ao tentar buscar despesas:", error);
    return NextResponse.json(
      { error: "Erro ao tentar buscar despesas." },
      { status: 500 }
    );
  }
}
