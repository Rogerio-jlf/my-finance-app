import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Define a interface dos campos obrigatórios
export interface IRecurrenceTypeProps {
  id: number;
  name: string;
}

// Função para criar um tipo de recorrência no banco de dados
export async function POST(req: Request) {
  try {
    // Parse do corpo da requisição com validação de tipo
    const body = (await req.json()) as IRecurrenceTypeProps;

    const { name } = body;

    // Verifica se os campos obrigatórios foram preenchidos
    if (!name) {
      return NextResponse.json(
        { error: "Todos os campos do fomrmulário são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se o tipo de recorrência já existe no banco de dados
    const existingRecurrenceType = await prisma.recurrenceType.findFirst({
      where: { name },
    });

    // Se o tipo de recorrência já existe, retorna um erro
    if (existingRecurrenceType) {
      return NextResponse.json(
        { error: "Já existe um tipo de recorrência cadastrado com esse nome." },
        { status: 400 }
      );
    }

    // Cria o tipo de recorrência no banco de dados
    const newRecurrenceType = await prisma.recurrenceType.create({
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Retorna o tipo de recorrência criado com mensagem de sucesso
    return NextResponse.json(
      {
        message: "Tipo de recorrência criado com sucesso!",
        newRecurrenceType: newRecurrenceType,
      },
      { status: 201 }
    );
    // Caso ocorra um erro, retorna uma mensagem de erro
  } catch (error) {
    console.error("Erro ao tentar criar tipo de recorrência:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------------------

// Função para buscar todos os tipos de recorrência no banco de dados
export async function GET() {
  try {
    // Busca todos os tipos de recorrência no banco de dados
    const recurrenceTypes = await prisma.recurrenceType.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Retorna os tipos de recorrência encontrados
    return NextResponse.json(recurrenceTypes, { status: 200 });
    // Caso ocorra um erro, retorna uma mensagem de erro
  } catch (error) {
    console.error("Erro ao tentar buscar os tipos de recorrência:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
