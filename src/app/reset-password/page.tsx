"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Pegar o token da query string
  const token = searchParams ? searchParams.get("token") : null;

  // Função para validar a senha
  function validatePassword(password: string) {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    return regex.test(password);
  }

  // Função para redefinir a senha do usuário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      setErrorPassword(
        "A senha deve conter pelo menos 8 caracteres, uma letra maiúscula e um caractere especial."
      );
      return;
    }

    // Enviar a nova senha para a API de redefinição de senha
    const response = await fetch("/api/auth/resetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    // Verificar se a senha foi redefinida com sucesso
    if (response.ok) {
      setMessage("Senha redefinida com sucesso. Redirecionando...");
      setTimeout(() => router.push("/login"), 3000);
    } else {
      const error = await response.json();
      setMessage(error.error || "Erro ao redefinir a senha.");
    }
  }

  // Função para alternar a visibilidade da senha
  function toggleShowPassword() {
    setShowPassword(!showPassword);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 shadow-lg w-full">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-md shadow-md w-full max-w-sm relative"
      >
        {/* h1 */}
        <div>
          <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            Redefinir Senha
          </h1>
        </div>

        {/* Input Password */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">
            Nova senha:
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Digite sua nova senha"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-2 top-7"
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>

          {/* Error Password */}
          {errorPassword && (
            <div>
              <p className="text-red-500 text-xs italic mt-4">
                {errorPassword}
              </p>
            </div>
          )}
        </div>

        {/* Link Login */}
        <div className="text-start">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
            Voltar para o login
          </Link>
        </div>

        {/* Button Submit */}
        <div className="mb-4">
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Redefinir
          </button>
        </div>

        {/* MSg */}
        {message && (
          <div>
            <p className="text-red-500 text-xs italic mt-4">{message}</p>
          </div>
        )}
      </form>
    </div>
  );
}
