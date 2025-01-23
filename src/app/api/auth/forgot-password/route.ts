import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Verifica se o usuário existe no banco de dados
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (!userExists) {
    return NextResponse.json(
      { error: "Se o e-mail existir, você receberá um link de redefinição." },
      { status: 200 }
    );
  }

  // Gera um token único para recuperação de senha (UUID v4)
  const token = uuidv4();

  // Define o tempo de expiração do token
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora de validade

  // Salva o token no banco de dados
  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  // Gera um transporte para envio de e-mails
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Link para redefinição de senha
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  // Envia o e-mail de recuperação
  await transporter.sendMail({
    from: `Rogério Ferreira <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Redefinição de Senha",
    text: `Clique no link para redefinir sua senha: ${resetLink}`,
  });

  // Retorna a resposta
  return NextResponse.json({ message: "E-mail de recuperação enviado" });
}
