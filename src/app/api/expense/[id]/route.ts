import prisma from "@/lib/prisma";
import { IExpenseProps } from "@/types/interface";
import { NextResponse } from "next/server";

// API PARA DELETAR UMA DESPESA ESPECÍFICA NO BANCO DE DADOS
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const existingExpense = await prisma.expense.findUnique({
    where: { id: Number(id) },
  });

  if (!existingExpense) {
    return NextResponse.json(
      { error: "Despesa não encontrada. Verifique!" },
      { status: 404 }
    );
  }

  try {
    const expense = await prisma.expense.delete({
      where: { id: Number(id) },
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
            recurrence_month: true,
            recurrence_year: true,
            recurrence_due_date: true,
            recurrence_amount: true,
          },
        },

        installmentExpense: {
          select: {
            installment_number: true,
            installment_amount: true,
            installment_due_date: true,
          },
        },

        status: true,
      },
    });

    return NextResponse.json(
      { message: "Despesa deletada com sucesso!", expense },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao tentar deletar despesa:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

// API PARA ATUALIZAR UMA DESPESA ESPECÍFICA NO BANCO DE DADOS
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const data: Partial<IExpenseProps> = await req.json();

  try {
    const existingExpense = await prisma.expense.findUnique({
      where: { id: Number(id) },
      include: {
        recurrenceExpense: true,
        installmentExpense: true,
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Despesa não encontrada. Verifique!" },
        { status: 404 }
      );
    }

    // Função auxiliar para padronizar a data sem timezone
    const normalizeDate = (date: Date | string) => {
      const d = new Date(date);
      return new Date(
        Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 3, 0, 0, 0)
      );
    };

    // Atualiza os dados principais da despesa no banco de dados
    const updatedExpense = await prisma.expense.update({
      where: { id: Number(id) },
      data: {
        description: data.description,
        amount: data.amount,
        entry_date: data.entry_date
          ? normalizeDate(
              new Date(
                new Date(data.entry_date).setDate(
                  new Date(data.entry_date).getDate() + 1
                )
              )
            )
          : undefined,
        expense_category_id: data.expense_category_id,
        payment_method_id: data.payment_method_id,
        recurrence_type_id: data.recurrence_type_id,
        due_date: data.due_date
          ? normalizeDate(
              new Date(
                new Date(data.due_date).setDate(
                  new Date(data.due_date).getDate() + 1
                )
              )
            )
          : undefined,
        installments: data.installment,
      },
    });

    // Lógica para atualização do tipo de recorrência (recorrente -> não recorrente ou parcelada -> não parcelada)
    if (data.recurrence_type_id === 2) {
      // Se estiver mudando para um tipo não recorrente (recorrente para não recorrente)
      if (existingExpense.recurrence_type_id === 1) {
        await prisma.recurrenceExpense.deleteMany({
          where: { expense_id: Number(id) },
        });
      }

      // Se estiver mudando de parcelada para não parcelada
      if (existingExpense.recurrence_type_id === 3) {
        await prisma.installmentExpense.deleteMany({
          where: { expense_id: Number(id) },
        });
      }

      await prisma.expense.update({
        where: { id: Number(id) },
        data: { due_date: null },
      });
    }

    // // - ATUALIZAR PARA DESPESA RECORRENTE
    // ATUALIZA UMA DESPESA ÚNICA PARA UMA DESPESA RECORRENTE
    // Função auxiliar para gerar as recorrências
    const generateRecurrences = (
      startDate: Date,
      amount: number,
      expenseId: number
    ) => {
      const recurrenceData = [];
      const dueDay = startDate.getDate();

      // Gera as recorrências para os próximos 12 meses
      for (let i = 0; i < 12; i++) {
      const recurrenceMonth = (startDate.getMonth() + i) % 12;
      const recurrenceYear =
        startDate.getFullYear() + Math.floor((startDate.getMonth() + i) / 12);

      // Calcula as datas de vencimento das recorrências
      const recurrenceDueDate = normalizeDate(
        new Date(recurrenceYear, recurrenceMonth, dueDay + 1)
      );

      // Armazena os dados da recorrência no array
      recurrenceData.push({
        expense_id: expenseId,
        recurrence_month: recurrenceMonth + 1,
        recurrence_year: recurrenceYear,
        recurrence_due_date: recurrenceDueDate,
        recurrence_amount: amount,
      });
      }

      return recurrenceData;
    };

    const handleRecurrenceUpdate = async (
      startDate: Date,
      amount: number,
      expenseId: number
    ) => {
      const recurrenceData = generateRecurrences(startDate, amount, expenseId);

      // Cria a recorrência no banco de dados
      await prisma.recurrenceExpense.createMany({
      data: recurrenceData,
      });
    };

    if (data.recurrence_type_id === 1) {
      const startDate = new Date(
      data.due_date || existingExpense.due_date || new Date()
      );
      const recurrenceAmount =
      typeof data.amount === "number" ? data.amount : Number(data.amount);

      if (existingExpense.recurrence_type_id === 2) {
      await handleRecurrenceUpdate(startDate, recurrenceAmount, Number(id));
      }

      if (existingExpense.recurrence_type_id === 3) {
      await prisma.installmentExpense.deleteMany({
        where: { expense_id: Number(id) },
      });
      await handleRecurrenceUpdate(startDate, recurrenceAmount, Number(id));
      }

      if (existingExpense.recurrence_type_id === 1) {
      await prisma.recurrenceExpense.deleteMany({
        where: { expense_id: Number(id) },
      });
      await handleRecurrenceUpdate(startDate, recurrenceAmount, Number(id));
      }
    }

    //// - ATUALIZAR PARA DESPESA PARCELADA
    const purchaseDate = new Date(
      data.due_date || existingExpense.due_date || new Date()
    );

    const generateInstallments = (
      startDate: Date,
      amount: number,
      installments: number,
      expenseId: number
    ) => {
      const installmentData = [];
      const installmentAmount = amount / installments;
      const due_date = startDate.getDate();

      for (let i = 0; i < installments; i++) {
      let installmentMonth = startDate.getMonth() + i;
      let installmentYear = startDate.getFullYear();

      if (installmentMonth > 11) {
        installmentMonth = installmentMonth % 12;
        installmentYear++;
      }

      const dueDate = new Date(installmentYear, installmentMonth, due_date + 1);

      installmentData.push({
        expense_id: expenseId,
        installment_number: i + 1,
        installment_amount: installmentAmount,
        installment_due_date: dueDate,
      });
      }

      return installmentData;
    };

    if (
      data.recurrence_type_id === 3 &&
      data.installment &&
      data.installment > 1
    ) {
      if (existingExpense.recurrence_type_id === 1) {
      await prisma.recurrenceExpense.deleteMany({
        where: { expense_id: Number(id) },
      });
      }

      if (existingExpense.recurrence_type_id === 3) {
      await prisma.installmentExpense.deleteMany({
        where: { expense_id: Number(id) },
      });
      }

      const installmentData = generateInstallments(
      purchaseDate,
      data.amount ?? 0,
      data.installment,
      Number(id)
      );

      await prisma.installmentExpense.createMany({ data: installmentData });
    }

    

    // Retorna resposta de sucesso
    return NextResponse.json(
      { message: "Despesa atualizada com sucesso!", expense: updatedExpense },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao tentar atualizar despesa: ", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
