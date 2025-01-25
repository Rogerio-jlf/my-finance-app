"use client";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DropDown from "./DropDown";
import { LogOut, Menu, Settings, UserPen } from "lucide-react";
import { useState } from "react";

// Componente de cabeçalho da aplicação
export default function Header() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Lida com o logout do usuário e remove o token do cookie
  function handleLogout() {
    setIsLoading(true);
    Cookies.remove("token");
    setIsAuthenticated(false);
    setError("Saindo...");
    setTimeout(() => {
      setIsLoading(false);
      router.push("/login");
    }, 1000);
  }

  // Renderiza o cabeçalho
  return (
    <div>
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="flex justify-between items-center">
          {/* h1 */}
          <div>
            <h1 className="text-white text-2xl font-bold">
              <Link href="/">Finance App</Link>
            </h1>
          </div>

          <div>
            {/* nav */}
            <nav className="flex space-x-4">
              {isAuthenticated ? (
                // buttons
                <div className="flex space-x-4">
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saindo..." : "Logout"}
                  </button>

                  {/* DropDown */}
                  <DropDown
                    trigger={
                      <button className="flex justify-between gap-2  items-center bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300">
                        <Menu />
                        Menu
                      </button>
                    }
                    items={[
                      {
                        label: "Perfil",
                        onClick: () => router.push("/profile"),
                        icon: <UserPen className="h-4 w-4" />,
                      },
                      {
                        label: "Configurações",
                        onClick: () => router.push("/settings"),
                        icon: <Settings className="h-4 w-4" />,
                      },
                      {
                        label: "Sair",
                        onClick: () => handleLogout(),
                        icon: <LogOut className="h-4 w-4" />,
                      },
                    ]}
                  />
                  {error ? <p className="text-red-500 mt-4">{error}</p> : ""}
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="bg-green-500 text-black font-bold px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
}
