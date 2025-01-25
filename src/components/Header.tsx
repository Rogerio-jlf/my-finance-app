"use client";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DropDown from "./DropDown";
import { LogOut, Menu, Settings, UserPen } from "lucide-react";

// Componente de cabeçalho da aplicação
export default function Header() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const router = useRouter();

  // Lida com o logout do usuário e remove o token do cookie
  function handleLogout() {
    Cookies.remove("token");
    setIsAuthenticated(false);
    router.push("/login");
  }

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
                  >
                    Logout
                  </button>
                  <button
                    onClick={() => router.push("/profile")}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                  >
                    Profile
                  </button>

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
                        onClick: () => router.push("/"),
                        icon: <LogOut className="h-4 w-4" />,
                      },
                    ]}
                  />
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
