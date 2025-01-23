"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function UserForm() {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Função para atualizar o estado do formulário
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Limpa os erros de validação
    setErrorEmail("");
    setErrorPassword("");
    setError("");

    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  // Função para alternar a visibilidade da senha
  function toggleShowPassword() {
    setShowPassword(!showPassword);
  }

  function capitalizeWords(e: React.ChangeEvent<HTMLInputElement>) {
    const words = e.target.value.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] =
        words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    const capitalized = words.join(" ");
    setFormData((prevState) => ({
      ...prevState,
      name: capitalized,
    }));
  }

  function validateEmail(email: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  }

  function validatePassword(password: string) {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    return regex.test(password);
  }

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setErrorEmail("E-mail inválido. Digite um e-mail válido.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setErrorPassword(
        "A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula e um caractere especial."
      );
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        alert("Usuário criado com sucesso!");
        router.push("/login");
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    }
  };

  // Componente de formulário de cadastro de usuário
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 shadow-lg w-full">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-md shadow-md w-full max-w-sm relative"
      >
        {/* h1 */}
        <div>
          <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            Cadastro de Usuário
          </h1>
        </div>

        {/* Input Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome Completo:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => {
              handleChange(e);
              capitalizeWords(e);
            }}
            minLength={10}
            required
            placeholder="Digite seu nome"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
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
            value={formData.email}
            onChange={handleChange}
            minLength={10}
            required
            placeholder="Digite seu e-mail"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />

          {/* Error Email */}
          {errorEmail && (
            <div>
              <p className="text-red-500 text-xs italic mt-4">{errorEmail}</p>
            </div>
          )}
        </div>

        {/* Input Password */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">
            Senha:
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
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

          {/* Error Password */}
          {errorPassword && (
            <div>
              <p className="text-red-500 text-xs italic mt-4">
                {errorPassword}
              </p>
            </div>
          )}
        </div>

        <div className="text-start">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
            Já tem uma conta? Faça login
          </Link>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cadastrar
          </button>

          {/* Error */}
          {error && (
            <div>
              <p className="text-red-500 text-xs italic mt-4">{error}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
