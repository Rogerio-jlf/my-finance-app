import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Verifica se o campo obrigatório foi preenchido
  if (!email) {
    return NextResponse.json(
      { error: "O campo de e-mail é obrigatório." },
      { status: 400 }
    );
  }

  // Verifica se o usuário existe no banco de dados
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (!userExists) {
    return NextResponse.json(
      { error: "Email incorreto ou inválido. Usuário não encontrado." },
      { status: 404 }
    );
  }

  // Remove todos os tokens antigos do usuário no banco de dados
  await prisma.passwordResetToken.deleteMany({
    where: {
      email,
    },
  });

  // Gera um token único para recuperação de senha
  const token = uuidv4();

  // Define o tempo de expiração do token (1 hora)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

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

  // Link para redefinir senha
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  // Envia o e-mail de recuperação de senha para o usuário
  await transporter.sendMail({
    from: `Rogério Ferreira <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Solicitação Redefinir Senha",
    text: `Clique no link para redefinir sua senha: ${resetLink}`,
  });

  // Retorna a resposta de sucesso para o usuário
  return NextResponse.json({
    message: "E-mail de recuperação enviado com sucesso!",
  });
}
