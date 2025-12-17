"use client";

import { useState } from "react";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, status } = useSession();

  const isGoogleUser = session?.user?.isGoogleUser === true;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="text-center mt-20 text-red-600">
        Accès non autorisé.
      </div>
    );
  }

  const handleChange = async () => {
    setMessage("");
    setError("");

    if (!oldPassword || !newPassword || !confirm) {
      return setError("Veuillez remplir tous les champs.");
    }

    if (newPassword.length < 6) {
      return setError(
        "Le nouveau mot de passe doit contenir au moins 6 caractères."
      );
    }

    if (newPassword !== confirm) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    setLoading(true);
    try {
      await axios.post("/api/update-password", {
        oldPassword,
        newPassword,
      });

      setMessage("Mot de passe modifié avec succès. Déconnexion en cours...");

      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-[var(--mint-300)] mb-6">
        Settings – Changer le mot de passe
      </h2>

      {error && (
        <p className="mb-4 text-red-600 bg-red-100 px-3 py-2 rounded">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 text-green-600 bg-green-100 px-3 py-2 rounded">
          {message}
        </p>
      )}

      {isGoogleUser ? (
        <div className="space-y-4">
          <div className="p-4 bg-red-100 text-red-700 rounded text-sm">
            <b>Compte Google détecté</b>
            <br />
            Votre mot de passe est géré directement par Google.
            <br />
            Le changement de mot de passe n’est pas disponible ici.
          </div>

          <button
            onClick={() => window.history.back()}
            className="w-full py-2 rounded bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition"
          >
            ← Retour
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="font-medium">Ancien mot de passe</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 bg-gray-100 rounded focus:outline-none"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Nouveau mot de passe</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 bg-gray-100 rounded focus:outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Confirmer le mot de passe</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 bg-gray-100 rounded focus:outline-none"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            onClick={handleChange}
            className="w-full py-2 mt-4 rounded bg-[var(--mint-300)] text-white font-semibold hover:bg-[var(--mint-100)] transition"
          >
            {loading ? "Traitement..." : "Changer le mot de passe"}
          </button>
        </div>
      )}
    </div>
  );
}
