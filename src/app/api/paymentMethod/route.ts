import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Define a interface dos campos obrigatórios
export interface IPaymentMethod {
  id: number;
  name: string;
}

// Função para criar um método de pagamento no banco de dados
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IPaymentMethod;

    const { name } = body;

    // Verifica se os campos obrigatórios foram preenchidos
    if (!name) {
      return NextResponse.json(
        { error: "Todos os campos do formulário são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se o método de pagamento já existe no banco de dados
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: { name },
    });

    // Se o método de pagamento já existe, retorna um erro
    if (existingPaymentMethod) {
      return NextResponse.json(
        {
          error:
            "Já existe um método de pagamento cadastrado com esse nome. Verifique!",
        },
        { status: 400 }
      );
    }

    // Cria e salva o método de pagamento no banco de dados
    const newPaymentMethod = await prisma.paymentMethod.create({
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Retorna o método de pagamento criado com uma mensagem de sucesso
    return NextResponse.json(
      {
        message: "Método de pagamento criado com sucesso!",
        paymentMethod: newPaymentMethod,
      },
      { status: 201 }
    );
    // Caso ocorra um erro, retorna uma mensagem de erro
  } catch (error) {
    console.error("Erro ao tentar criar método de pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------------------

// Função para listar todos os métodos de pagamento cadastrados no banco de dados
export async function GET() {
  // Tenta buscar os métodos de pagamento no banco de dados
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Retorna a lista de métodos de pagamento
    return NextResponse.json(paymentMethods, { status: 200 });
    // Caso ocorra um erro, retorna uma mensagem de erro
  } catch (error) {
    console.error("Erro ao tentar listar os métodos de pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
