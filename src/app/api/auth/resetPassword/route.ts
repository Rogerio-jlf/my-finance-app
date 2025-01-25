import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Função de rota para redefinir a senha
export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  // Verifica se o campo obrigatório foi preenchido
  if(!newPassword) {
    return NextResponse.json(
      { error: "Todos os campos são obrigatórios." },
      { status: 400 }
    );
  }

  // Busca o token no banco de dados
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  // Verifica se o token é válido
  if (!resetToken || resetToken.expiresAt < new Date() || resetToken.used) {
    return NextResponse.json(
      { error: "Token inválido ou expirado." },
      { status: 400 }
    );
  }

  // Busca o email do usuário associado ao token
  const { email } = resetToken;

  // Gerar o hash da nova senha
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Atualiza a senha do usuário no banco de dados
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Marca o token como usado no banco de dados
  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true },
  });

  // // Remove todos os tokens antigos do usuário
  // await prisma.passwordResetToken.deleteMany({
  //   where: {
  //     token,
  //   },
  // });

  // Retorna uma resposta de sucesso
  return NextResponse.json({ message: "Senha redefinida com sucesso!" });
}
