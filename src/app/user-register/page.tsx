"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// Componente de cadastro de usuário
export default function UserRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorEmailMessage, setErrorEmailMessage] = useState("");
  const [errorPasswordMessage, setErrorPasswordMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // Lida com a mudança dos campos do formulário
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Limpa os erros de validação
    setErrorEmailMessage("");
    setErrorPasswordMessage("");
    setErrorMessage("");

    // Atualiza os valores do formulário com os dados do input 
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  // Alterna a visibilidade da senha
  function toggleShowPassword() {
    setShowPassword(!showPassword);
  }

  // Torna a primeira letra de cada palavra maiúscula
  function capitalizeWords(e: React.ChangeEvent<HTMLInputElement>) {
    const words = e.target.value.split(" ");
    const lowerCaseWords = ["e", "da", "das", "de", "di", "do", "dos"];

    for (let i = 0; i < words.length; i++) {
      if (lowerCaseWords.includes(words[i].toLowerCase())) {
        words[i] = words[i].toLowerCase();
      } else {
        words[i] =
          words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
      }
    }

    const capitalized = words.join(" ");
    setFormData((prevState) => ({
      ...prevState,
      name: capitalized,
    }));
  }

  // Valida o formato do e-mail
  function validateEmail(email: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  }

  // Valida o formato da senha
  function validatePassword(password: string) {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    return regex.test(password);
  }

  // Lida com o envio do formulário de cadastro de usuário
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Valida o formato do e-mail
    if (!validateEmail(formData.email)) {
      setErrorEmailMessage("E-mail inválido. Digite um e-mail válido.");
      return;
    }

    // Valida o formato da senha
    if (!validatePassword(formData.password)) {
      setErrorPasswordMessage(
        "A senha deve conter no mínimo 8 caracteres. Deve conter pelo menos uma letra maiúscula e um caractere especial."
      );
      return;
    }

    // Envia os dados do formulário para a API
    try {
      const response = await fetch("/api/userRegister", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Armaneza a resposta da API
      const data = await response.json();

      // Verifica se o usuário foi criado com sucesso ou não
      if (response.ok) {
        alert("Usuário criado com sucesso!");
        router.push("/login");
      } else {
        setErrorMessage(data.error);
      }
    } catch (error) {
      console.error("Erro ao tentar criar usuário:", error);
    }
  }

  // Renderiza o formulário de cadastro de usuário
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
          {errorEmailMessage && (
            <div>
              <p className="text-red-500 text-xs italic mt-4">
                {errorEmailMessage}
              </p>
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
          {errorPasswordMessage && (
            <div>
              <p className="text-red-500 text-xs italic mt-4">
                {errorPasswordMessage}
              </p>
            </div>
          )}
        </div>

        <div className="text-start">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
            Já tem uma conta? Faça login
          </Link>
        </div>

        {/* Button Submit */}
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cadastrar
          </button>

          {/* Error Geral*/}
          {errorMessage && (
            <div>
              <p className="text-red-500 text-sm italic mt-4">{errorMessage}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
