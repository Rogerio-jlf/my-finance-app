// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Função para verificar o token
function verifyToken(token: string) {
  try {
    // Decodifica o token com a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch {
    return null;
  }
}

// Endpoint para dados do dashboard (rota protegida)
export async function GET(req: Request) {
  // Obter o token do cabeçalho da requisição (Bearer Token)
  const token = req.headers.get("Authorization")?.split(" ")[1];

  // Se o token não for fornecido, retornar um erro
  if (!token) {
    return NextResponse.json({ error: "Token não encontrado." }, { status: 401 });
  }

  // Verifica se o token é válido
  const user = verifyToken(token);

  // Se o token for inválido, retorna um erro
  if (!user) {
    return NextResponse.json(
      { error: "Token inválido ou expirado." },
      { status: 401 }
    );
  }

  // Se o token for válido, você pode retornar os dados do dashboard ou do usuário
  return NextResponse.json({ message: "Bem-vindo ao Dashboard.", user });
}
