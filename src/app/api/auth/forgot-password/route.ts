import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma"; // Sua conexão com o banco de dados

const tokens = new Map<string, { email: string; expires: number }>(); // Apenas para teste. Use um banco de dados em produção.

export async function POST(req: Request) {
  const { email } = await req.json();

  // Verifica se o e-mail existe no banco
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "E-mail não encontrado" }, { status: 404 });
  }

  // Gera um token único e temporário
  const token = uuidv4();
  const expires = Date.now() + 1000 * 60 * 60; // 1 hora de validade
  tokens.set(token, { email, expires });

  // Envia o token por e-mail
  const transporter = nodemailer.createTransport({
    service: "Gmail", // ou outro serviço de e-mail
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Redefinição de Senha",
    text: `Clique no link para redefinir sua senha: ${resetLink}`,
  });

  return NextResponse.json({ message: "E-mail de recuperação enviado" });
}
