import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export interface IExpenseCategory {
  id: number;
  name: string;
}

// Função para criar categoria de despesa
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IExpenseCategory;

    const { name } = body;

    // verifica se o campo obrigatório foi preenchido
    if (!name) {
      return NextResponse.json(
        { error: "Todos os campos do fomrmulário são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se a categoria já existe no banco de dados
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: { name },
    });

    // Se a categoria já existe, retorna um erro
    if (existingCategory) {
      return NextResponse.json(
        {
          error: "Já existe uma categoria cadastrada com esse nome. Verifique!",
        },
        { status: 400 }
      );
    }

    // Cria e salva a categoria no banco de dados
    const newCategory = await prisma.expenseCategory.create({
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Retorna a categoria criada com uma mensagem de sucesso
    return NextResponse.json(
      { message: "Categoria criada com sucesso!", category: newCategory },
      { status: 201 }
    );
    // Caso ocorra um erro, retorna uma mensagem de erro
  } catch (error) {
    console.error("Erro ao tentar criar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao tentar criar categoria." },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------------------

// Função para buscar todas as categorias de despesa
export async function GET() {
  // Tenta buscar as categorias no banco de dados
  try {
    const categories = await prisma.expenseCategory.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Retorna as categorias encontradas com status 200
    return NextResponse.json(categories, { status: 200 });
    // Caso ocorra um erro, retorna uma mensagem de erro
  } catch (error) {
    console.error("Erro ao tentar buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro ao tentar buscar categorias." },
      { status: 500 }
    );
  }
}
