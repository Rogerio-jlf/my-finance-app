"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const router = useRouter();

  // função para lidar com o envio do formulário
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Envia os dados do formulário para a API de autenticação
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Inclui cookies enviados pelo servidor
      });

      // Verifica se a resposta da API foi bem-sucedida
      if (response.ok) {
        setEmail("");
        setPassword("");
        setIsAuthenticated(true);
        router.push("/dashboard");
      } else {
        const { error } = await response.json();
        setError(error || "Falha na autenticação.");
      }
    } catch {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  // Função para alternar a visibilidade da senha
  function toggleShowPassword() {
    setShowPassword(!showPassword);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 shadow-lg w-full">
      <form
        onSubmit={handleLogin}
        className="space-y-6 bg-white p-8 rounded-md shadow-md w-full max-w-sm relative"
      >
        {/* h1 */}
        <div>
          <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            Login
          </h1>
        </div>

        {/* input Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            E-mail:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Digite seu e-mail"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Input Senha */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">
            Senha:
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Digite sua senha"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-2 top-7"
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        </div>

        {/* Link Register */}
        <div className="text-start">
          <Link
            href="register"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Ainda não tem uma conta? Registre-se
          </Link>
        </div>

        {/* Link Forgot-Password */}
        <div className="text-start">
          <Link
            href="forgot-password"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        {/* Button Submit */}
        <div>
          <button
            type="submit"
            className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Entrar"}
          </button>

          {/* Error */}
          {error && (
            <div>
              <p className="text-red-500 text-xs italic mb-4">{error}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
