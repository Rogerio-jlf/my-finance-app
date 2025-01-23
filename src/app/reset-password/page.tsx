"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Pegar o token da query string
  const token = searchParams ? searchParams.get("token") : null;

  // Função para redefinir a senha do usuário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Enviar a nova senha para a API de redefinição de senha
    const response = await fetch("/api/auth/reset-password", {
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md relative"
      >
        <h1 className="text-2xl mb-6 text-center font-bold">Redefinir Senha</h1>
        <div className="mb-4 relative">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nova senha:
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 w-full"
            required
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-2 top-9"
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        </div>
        <div className="mb-4 text-center">
          <Link href="/login" className="text-blue-500 hover:underline">
            Voltar para o login
          </Link>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Digite sua nova senha para redefinir.
          </p>
        </div>
        <div className="mb-4">
          <button
            type="submit"
            className="bg-green-500 text-white p-2 w-full rounded hover:bg-green-600"
          >
            Redefinir
          </button>
        </div>
        {message && (
          <div>
            <p className="mt-4 text-center text-red-500">{message}</p>
          </div>
        )}
      </form>
    </div>
  );
}
