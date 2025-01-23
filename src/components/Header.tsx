"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const routerLogin = useRouter();

  function handleToLogin() {
    routerLogin.push("/login");
  }

  return (
    <nav className="fixed top-0 w-full flex items-center py-2 px-8 justify-between z-50 bg-slate-800 text-gray-300">
      <Link
        href="/"
        className="uppercase font-bold text-md h-12 flex items-center"
      >
        MY FINANCE APP
      </Link>
      <div className="flex items-center gap-8">
        <div>
          <button
            className="border rounded-md border-gray-400 px-3 py-2"
            onClick={handleToLogin}
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}
