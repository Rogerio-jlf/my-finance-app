import { NextResponse, NextRequest } from "next/server";
import { jwtVerify, JWTPayload } from "jose";

// Converte a chave secreta para um ArrayBuffer
const secretJWT = new TextEncoder().encode(process.env.JWT_SECRET);

// Middleware para proteger as rotas do dashboard
export async function middleware(req: NextRequest) {
  // Obtém o token dos cookies
  const token = req.cookies.get("token");

  // Se não houver token, redireciona para a página de login
  if (!token) {
    console.log("Nenhum token encontrado. Redirecionando para /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verifica o token JWT
    const { payload }: { payload: JWTPayload } = await jwtVerify(
      token.value,
      secretJWT
    );

    console.log("Token verificado com sucesso:", payload);

    return NextResponse.next();
  } catch (error) {
    if ((error as Error).name === "JWTExpired") {
      console.log("Token expirado. Redirecionando para /login");
    } else {
      console.log("Falha na verificação do token:", error);
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"], // Protege todas as rotas começando com /dashboard
};
