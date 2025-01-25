import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export interface creatUseProps {
  name: string;
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    // Parse do corpo da requisição com validação de tipo
    const body = (await req.json()) as creatUseProps;

    const { name, email, password } = body;

    // Verifica se os campos obrigatórios foram preenchidos
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos os campos do fomrmulário são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se o usuário já existe no banco de dados
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Se o usuário já existe, retorna um erro
    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário cadastrado com esse email." },
        { status: 400 }
      );
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Retorna o usuário criado
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      { message: "Usuário criado com sucesso!", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao tentar criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
