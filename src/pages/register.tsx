/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function Register() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const loadingToast = toast.loading("🕓 Création du compte en cours...");

    try {
      await axios.post("/api/register", { username, email, password });

      toast.dismiss(loadingToast);
      toast.success(
        "🎉 Compte créé avec succès ! Vous pouvez vous connecter.",
        {
          duration: 7000,
          position: "top-center",
          icon: "🚀",
          style: {
            borderRadius: "8px",
            background: "#16a34a", // mint-500
            color: "#fff",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
          },
        }
      );

      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMsg =
        err.response?.data?.error === "Email already registered"
          ? "❌ Cet email est déjà utilisé. Essayez de vous connecter."
          : "⚠️ Une erreur est survenue. Réessayez plus tard.";

      toast.error(errorMsg, {
        duration: 7000,
        position: "top-center",
        icon: "💥",
        style: {
          borderRadius: "8px",
          background: "#ef4444", // indian-red-500
          color: "#fff",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 500,
        },
      });
    }
  };

  return (
    <div className="grid grid-cols-5 bg-white min-h-screen font-sans">
      {/* --- Form Column --- */}
      <div className="col-span-5 md:col-span-3 lg:col-span-2 bg-air-superiority-blue-100">
        <div className="mx-12 md:mx-24 mt-12">
          <h1 className="text-gray-700 text-3xl font-semibold my-12">
            Create Account
          </h1>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-gray-700 py-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-full text-gray-600 focus:ring-2 focus:ring-mint-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 py-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-full text-gray-600 focus:ring-2 focus:ring-mint-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 py-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-full text-gray-600 focus:ring-2 focus:ring-mint-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--mint-500)] text-white px-3 py-4 rounded-full my-2 hover:bg-[var(--mint-400)] transition-colors"
            >
              Register
            </button>
          </form>

          <p className="text-gray-500 text-center font-thin mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--mint-500)] underline">
              Log in
            </Link>
          </p>
          <div className="text-gray-500 px-8 text-center my-4 relative">
            <span className="bg-air-superiority-blue-100 px-2">Or</span>
            <div className="absolute left-0 right-0 top-3 border-t border-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full bg-white text-gray-700 border border-gray-400 px-3 py-4 rounded-full my-2 hover:bg-[var(--mint-200)] hover:text-white transition-colors"
          >
            <div className="grid grid-cols-4 items-center">
              <Image
                src="/logo_googleAuth.png"
                alt="google logo"
                width={45}
                height={45}
                className="mx-2"
              />
              <span className="col-span-3">Sign up with Google</span>
            </div>
          </button>
        </div>
      </div>

      {/* --- Image Column --- */}
      <div className="hidden md:block col-span-2 lg:col-span-3 relative w-full h-full overflow-hidden rounded-l-3xl">
        <Image
          src="/logo_WellSync.png"
          alt="WellSync logo"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        
      </div>
    </div>
  );
}
