"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Toast si l’utilisateur revient de Google Auth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("authSuccess")) {
      toast.success("✅ Compte Google créé avec succès !", {
        duration: 6000,
        position: "top-center",
        icon: "🚀",
        style: {
          borderRadius: "8px",
          background: "#16a34a",
          color: "#fff",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 500,
        },
      });
    }
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("🔐 Connexion en cours...");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/dashboard",
    });

    toast.dismiss(loadingToast);

    if (result?.error) {
      toast.error("❌ Identifiants incorrects ou compte inexistant.", {
        duration: 6000,
        position: "top-center",
        icon: "💥",
        style: {
          borderRadius: "8px",
          background: "#ef4444",
          color: "#fff",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 500,
        },
      });
    } else {
      toast.success("✅ Connexion réussie ! Bienvenue 👋", {
        duration: 6000,
        position: "top-center",
        icon: "🚀",
        style: {
          borderRadius: "8px",
          background: "#16a34a",
          color: "#fff",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 500,
        },
      });
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  };

  return (
    <div className="grid grid-cols-5 min-h-screen bg-white">
      {/* Left Panel */}
      <div className="col-span-5 md:col-span-3 lg:col-span-2 bg-air-superiority-blue-100">
        <div className="mx-12 md:mx-24 mt-12">
          <h1 className="text-gray-700 text-3xl font-semibold my-12">
            Se connecter
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
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
              <label className="block text-gray-700 py-2">Mot de passe</label>
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
              Connexion
            </button>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full bg-white border border-gray-400 text-gray-700 px-3 py-4 rounded-full my-2 hover:bg-[var(--mint-200)] transition-colors"
            >
              <div className="grid grid-cols-4 items-center">
                <Image
                  src="/logo_googleAuth.png"
                  alt="google logo"
                  width={40}
                  height={40}
                  className="mx-2"
                />
                <span className="col-span-3">Se connecter avec Google</span>
              </div>
            </button>
          </form>

          <p className="text-gray-500 text-center font-thin mt-4">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-mint-500 underline">
              Créez-en un
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel */}
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
