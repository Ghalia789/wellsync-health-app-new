"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function GooglePasswordPopup({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirm)
      return toast.error("Veuillez remplir les deux champs !");
    if (password !== confirm)
      return toast.error("Les mots de passe ne correspondent pas !");
    if (password.length < 6)
      return toast.error("Le mot de passe doit contenir au moins 6 caractères");

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await axios.post("/api/update-password", {
        userId: user.id,
        password,
      });

      toast.success("✅ Mot de passe défini avec succès !");
      // ✅ On met à jour le localStorage pour indiquer que le compte est normalisé
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, password: "updated" })
      );

      // On ferme ce popup et ouvre celui de la photo
      onSuccess();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[360px] text-center shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Définis ton mot de passe</h2>

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3 text-gray-700"
        />

        <input
          type="password"
          placeholder="Confirme le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-5 text-gray-700"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          {loading ? "Enregistrement..." : "Confirmer"}
        </button>
      </div>
    </div>
  );
}
