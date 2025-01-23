"use client";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Header = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <div>
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-white text-2xl font-bold">
              <Link href="/">Finance App</Link>
            </h1>
          </div>
          <div>
            <nav className="flex space-x-4">
              {isAuthenticated ? (
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
};

export default Header;
