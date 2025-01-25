import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "defaultSecretKey";

export async function POST(request: Request) {
  try {
    // Desestruturar o email e a senha do corpo da requisição
    const { email, password } = await request.json();

    if(!email || !password) {
      return NextResponse.json(
        { error: "Os campos e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se o usuário existe no banco de dados
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    // Se o usuário não existir, retorna um erro 
    if (!userExists) {
      return NextResponse.json(
        { error: "Usuário e/ou senha incorretos." },
        { status: 401 }
      );
    }

    // Compara a senha fornecida com a senha armazenada no banco de dados
    const isPasswordValid = await bcrypt.compare(password, userExists.password);

    // Se a senha não for válida, retorna um erro
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Usuário e/ou senha incorretos." },
        { status: 401 }
      );
    }

    // Gera um token JWT para o usuário
    const token = jwt.sign({ userId: userExists.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Retorna uma resposta com o token
    const response = NextResponse.json({ message: "Login realizado com sucesso!" });

    // Defini o cookie e salva o token nele
    response.cookies.set("token", token, {
      httpOnly: false, // Permite acesso via JavaScript (não recomendado) - use true em produção
      secure: process.env.NODE_ENV === "production", // Apenas HTTPS em produção
      sameSite: "strict", // Proteção contra CSRF
      path: "/", // Disponível para todas as rotas
      maxAge: 7 * 24 * 60 * 60, // Expira em 7 dias
    });

    // Retorna a resposta com o token
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao tentar realizar login. Verifique!" },
      { status: 500 }
    );
  }
}
