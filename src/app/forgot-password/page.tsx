"use client";
import Link from "next/link";
import { useState } from "react";

// Componente da página de recuperação de senha
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lida com o envio do formulário de recuperação de senha
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // Envia a requisição para a API de recuperação de senha
    const response = await fetch("/api/auth/forgotPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // Verifica se a requisição foi bem-sucedida ou não
    if (response.ok) {
      setSuccessMessage(
        "E-mail de recuperação enviado com sucesso. Verifique sua caixa de entrada."
      );
      setErrorMessage("");
    } else {
      const error = await response.json();
      setErrorMessage(error.error);
      setSuccessMessage("");
    }
    setIsLoading(false);
  }

  // Renderiza o formulário de recuperação de senha
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 shadow-lg w-full">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-md shadow-md w-full max-w-sm relative"
      >
        {/* h1 */}
        <div>
          <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            Recuperar Senha
          </h1>
        </div>

        {/* Input Email */}
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
            placeholder="Seu e-mail"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Link Login */}
        <div className="text-start">
          <Link href="/login" className="text-blue-400 hover:text-red-500 italic font-bold">
            Voltar para o login
          </Link>
        </div>

        {/* MSG */}
        <div>
          <p className="text-xs text-gray-500 mb-4">
            Será enviado um e-mail com um link para redefinir sua senha.
          </p>
        </div>

        {/* Button Submit */}
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar"}
          </button>
        </div>

        {errorMessage ? (
          <div>
            <p className="text-red-500 text-xs italic mt-4">{errorMessage}</p>
          </div>
        ) : successMessage ? (
          <div>
            <p className="text-green-500 text-sm font-bold mt-4">
              {successMessage}
            </p>
          </div>
        ) : null}
      </form>
    </div>
  );
}
