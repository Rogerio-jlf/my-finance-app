import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Função para deletar categoria de despesa
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Extrai o id da categoria dos parâmetros
  const { id } = params;

  // Verifica se a categoria existe no banco de dados
  const existinCategory = await prisma.expenseCategory.findUnique({
    where: {
      id: Number(id),
    },
  });

  // Se a categoria não existe, retorna um erro
  if (!existinCategory) {
    return NextResponse.json(
      { error: "Categoria não encontrada. Verifique!" },
      { status: 404 }
    );
  }

  // Tenta deletar a categoria do banco de dados
  try {
    const category = await prisma.expenseCategory.delete({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Retorna a categoria deletada com uma mensagem de sucesso
    return NextResponse.json(
      { message: "Categoria deletada com sucesso!", category },
      { status: 200 }
    );
    // Caso ocorra um erro, retorna uma mensagem de erro
  } catch (error) {
    console.error("Erro ao tentar deletar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao tentar deletar categoria." },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------------------

// Função para buscar categoria por id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Extrai o id da categoria dos parâmetros
  const { id } = params;

  // Verifica se a categoria existe no banco de dados
  const existinCategory = await prisma.expenseCategory.findUnique({
    where: {
      id: Number(id),
    },
  });

  // Se a categoria não existe, retorna um erro
  if (!existinCategory) {
    return NextResponse.json(
      { error: "Categoria não encontrada. Verifique!" },
      { status: 404 }
    );
  }

  // Tenta buscar a categoria no banco de dados
  try {
    const category = await prisma.expenseCategory.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Retorna a categoria encontrada com status 200
    return NextResponse.json(category, { status: 200 });
    // Caso ocorra um erro, retorna uma mensagem de erro
  } catch (error) {
    console.error("Erro ao tentar buscar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao tentar buscar categoria." },
      { status: 500 }
    );
  }
}
