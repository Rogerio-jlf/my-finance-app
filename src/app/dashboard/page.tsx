"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect para carregar os dados do usuário
  useEffect(() => {
    // Função para fazer a requisição à API de autenticação
    async function fetchData() {
      // Obtém o token de autenticação do cookie
      const token = Cookies.get("token");

      // Se não houver token, redireciona para a página de login
      if (!token) {
        setError("Sessão expirada. Redirecionando...");
        setTimeout(() => router.push("/"), 2000);
        return;
      }

      try {
        // Requisição para a rota /api/auth/dashboard com o token de autenticação
        const response = await fetch("/api/auth/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.status === 200) {
          const result = await response.json();
          setData(result);
        } else if (response.status === 401) {
          setError("Sessão expirada. Redirecionando...");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          const result = await response.json();
          setError(result.error || "Erro ao carregar os dados.");
        }
      } catch {
        setError("Erro inesperado. Por favor, tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }

    // Chama a função fetchData
    fetchData();
  }, [router]);

  // Função para lidar com o logout
  function handleLogout() {
    Cookies.remove("token");
    setError("Saindo...");
    setTimeout(() => router.push("/login"), 1000);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
      {error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : loading ? (
        <p className="mt-4">Carregando...</p>
      ) : (
        <pre className="mt-4">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
