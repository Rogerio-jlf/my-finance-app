"use client";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Função para enviar o e-mail de recuperação
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Envia a requisição para a API de recuperação de senha
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // Verifica se a requisição foi bem-sucedida
    if (response.ok) {
      setMessage(
        "E-mail de recuperação enviado. Verifique sua caixa de entrada."
      );
    } else {
      const error = await response.json();
      setMessage(error.error || "Erro ao enviar o e-mail.");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl mb-4 text-center">Recuperar Senha</h1>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            E-mail:
          </label>
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>

        <div className="mb-4">
          <Link href="/login" className="text-blue-500 hover:underline">
            Voltar para o login
          </Link>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Será enviado um e-mail com um link para redefinir sua senha.
          </p>
        </div>
        <div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
          >
            Enviar
          </button>
        </div>
        {message && (
          <div>
            <p className="mt-4 text-center text-green-500">{message}</p>
          </div>
        )}
      </form>
    </div>
  );
}
