/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unauthorized");
        }

        setMessage(data.message);
      } catch (err: any) {
        const errorMsg = err.message || "Unknown error";
        console.error("❌ Dashboard error:", errorMsg);

        // 🚨 Si le token est expiré ou invalide
        if (errorMsg.includes("expired") || errorMsg.includes("Unauthorized")) {
          toast.error("⏰ Votre session a expiré. Veuillez vous reconnecter.", {
            icon: "🔒",
            style: {
              borderRadius: "8px",
              background: "#ff4d4f",
              color: "#fff",
              fontWeight: "500",
              fontFamily: "Poppins, sans-serif",
            },
          });

          // 🔥 Supprime le cookie manuellement
          document.cookie = "token=; Max-Age=0; path=/;";

          // ⏳ Redirige après 2 secondes
          setTimeout(() => router.push("/login"), 2000);
        } else {
          toast.error("⚠️ Une erreur est survenue. Réessayez plus tard.");
        }
      }
    };

    fetchDashboard();
  }, [router]);

  if (!message) {
    return (
      <div className="text-gray-500 text-center mt-10 animate-pulse">
        Chargement...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-4 animate-fade-in">
        {message}
      </h1>
      <p className="text-gray-600">Bienvenue sur votre tableau de bord 🚀</p>
    </div>
  );
};

export default DashboardPage;
