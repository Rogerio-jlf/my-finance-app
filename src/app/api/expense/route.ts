import prisma from "@/lib/prisma";
import { IExpenseProps } from "@/types/interface";
import { NextResponse } from "next/server";

// Função genérica para validar campos obrigatórios
function checkRequiredFields(
  body: Partial<IExpenseProps>,
  requiredFields: string[]
) {
  for (const field of requiredFields) {
    if (!(body as Record<string, unknown>)[field]) {
      return NextResponse.json(
        { error: `O campo ${field} é obrigatório.` },
        { status: 400 }
      );
    }
  }
  return true;
}

// API CADASTRAR DESPESAS
export async function POST(req: Request) {
  // Converte o corpo da requisição para o tipo IExpenseProps
  const body = (await req.json()) as IExpenseProps;

  // Desestrutura os campos obrigatórios
  const {
    description,
    amount,
    entry_date,
    expense_category_id,
    payment_method_id,
    recurrence_type_id,
  } = body;

  // Lista de campos obrigatórios
  const requiredFields = [
    "description",
    "amount",
    "entry_date",
    "expense_category_id",
    "payment_method_id",
    "recurrence_type_id",
  ];

  // Adiciona os campos obrigatórios de acordo com o tipo de recorrência
  if (body.recurrence_type_id === 1) {
    requiredFields.push("due_date");
  } else if (body.recurrence_type_id === 3) {
    requiredFields.push("due_date");
    requiredFields.push("installment");
  }

  // Valida os campos antes de continuar
  const validation = checkRequiredFields(body, requiredFields);
  if (validation !== true) {
    return validation; // Retorna o erro se algum campo estiver faltando
  }

  // Função auxiliar para padronizar a data sem timezone
  const normalizeDate = (date: Date | string) => {
    const d = new Date(date);
    return new Date(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 3, 0, 0, 0)
    );
  };

  // ------------------------------------------------------------------------------

  // DESPESA RECORRENTE
  try {
    if (recurrence_type_id === 1 && body.due_date) {
      const newRecurrenceExpense = await prisma.expense.create({
        data: {
          description,
          amount,
          entry_date: normalizeDate(
            new Date(
              new Date(entry_date).setDate(new Date(entry_date).getDate() + 1)
            )
          ),
          expense_category_id,
          payment_method_id,
          recurrence_type_id,
          due_date: body.due_date
            ? normalizeDate(
                new Date(
                  new Date(body.due_date).setDate(
                    new Date(body.due_date).getDate() + 1
                  )
                )
              )
            : undefined,
        },
      });

      // Cria um array para armazenar os dados das recorrências
      const recurrenceData = [];
      // Converte a data de vencimento para o tipo Date
      const startDate = new Date(body.due_date);
      // Extrai o dia da data de vencimento
      const dueDay = startDate.getDate();

      // Gera as recorrências para os próximos 12 meses
      for (let i = 0; i < 1; i++) {
        const recurrenceMonth = (startDate.getMonth() + i) % 12;
        const recurrenceYear =
          startDate.getFullYear() + Math.floor((startDate.getMonth() + i) / 12);

        // Calcula as datas de vencimento das recorrências
        const recurrenceDueDate = normalizeDate(
          new Date(recurrenceYear, recurrenceMonth, dueDay + 1)
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
        {
          message: "Despesa recorrente cadastrada com sucesso!",
          expense: expenseRelations,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Erro ao tentar cadastrar despesa recorrente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }

  // ------------------------------------------------------------------------------

  // DESPESA ÚNICA
  try {
    if (recurrence_type_id === 2) {
      // Cria a despesa não recorrente no banco de dados
      const newNotRecurrenceExpense = await prisma.expense.create({
        data: {
          description,
          amount,
          entry_date: normalizeDate(
            new Date(
              new Date(entry_date).setDate(new Date(entry_date).getDate() + 1)
            )
          ),
          expense_category_id,
          payment_method_id,
          recurrence_type_id,
        },
      });

      // Retorna a despesa criada com uma mensagem de sucesso e status 201
      return NextResponse.json(
        {
          message: "Despesa única cadastrada com sucesso!",
          expense: newNotRecurrenceExpense,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Erro ao tentar cadastrar despesa única:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }

  // ------------------------------------------------------------------------------

  // DESPESA PARCELADA
  try {
    if (
      recurrence_type_id === 3 &&
      body.installment &&
      body.installment > 1 &&
      body.due_date
    ) {
      // Cria a despesa parcelada no banco de dados
      const newInstallmentsExpense = await prisma.expense.create({
        data: {
          description,
          amount,
          entry_date: normalizeDate(
            new Date(
              new Date(entry_date).setDate(new Date(entry_date).getDate() + 1)
            )
          ),
          expense_category_id,
          payment_method_id,
          recurrence_type_id,
          due_date: normalizeDate(
            new Date(
              new Date(body.due_date).setDate(
                new Date(body.due_date).getDate() + 1
              )
            )
          ),
        },
      });

      // Gera as parcelas da despesa
      const purchaseDate = new Date(body.due_date);
      const installmentData = [];
      const installmentAmount = amount / body.installment;

      // Gera as parcelas com base no número informado
      for (let i = 0; i < body.installment; i++) {
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
            purchaseDate.getDate() + 1
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
          message: "Despesa parcelada cadastrada com sucesso!",
          expense: expenseWithRelations,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Erro ao tentar cadastrar despesa única:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------------------

// API PARA BUSCAR TODAS AS DESPESAS
export async function GET() {
  // Tenta buscar as despesas no banco de dados
  try {
    const expenses = await prisma.expense.findMany({
      select: {
        id: true,
        description: true,
        amount: true,
        entry_date: true,
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
        recurrenceType: {
          select: {
            id: true,
            name: true,
          },
        },
        due_date: true,
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
        status: true,
      },
    });

    // Retorna as despesas encontradas com status 200
    return NextResponse.json({ expenses }, { status: 200 });
    // Retorna uma mensagem de erro genérica
  } catch (error) {
    console.error("Erro ao tentar buscar despesas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------------------
