"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import { useSession, signIn } from "next-auth/react";

export default function HistoryPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loadingClear, setLoadingClear] = useState(false);
    // const { data: session } = useSession();
    const [showClearModal, setShowClearModal] = useState(false);
    const [clearCode, setClearCode] = useState("");
    const [sending, setSending] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [clearMsg, setClearMsg] = useState("");
    const [clearErr, setClearErr] = useState("");

  useEffect(() => {
    fetch("/api/history")
      .then(res => res.json())
      .then(data => setGoals(data.history || []))
      .finally(() => setLoading(false));
  }, []);
    async function requestClearCode() {
    setSending(true);
    setClearErr("");
    setClearMsg("");
    try {
        const res = await fetch("/api/history/request-clear", { method: "POST" });
        const data = await res.json();
        if (!res.ok) return setClearErr(data.error || "Erreur envoi code");
        setClearMsg("Code envoyé par email. Vérifiez votre boîte.");
    } finally {
        setSending(false);
    }
    }

    async function confirmClearHistory() {
    setClearing(true);
    setClearErr("");
    try {
        const res = await fetch("/api/history/confirm-clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clearCode }),
        });
        const data = await res.json();
        if (!res.ok) return setClearErr(data.error || "Erreur confirmation");
        setClearMsg("Historique supprimé !");
        setGoals([]); // vider UI
        setTimeout(() => setShowClearModal(false), 800);
    } finally {
        setClearing(false);
    }
    }

    async function clearHistory() {
    if (!password) {
        return setError("Mot de passe requis");
    }

    setLoadingClear(true);
    setError("");

    const res = await fetch("/api/history/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok) {
        setError(data.error || "Erreur");
        setLoadingClear(false);
        return;
    }

    // SUCCESS
    setGoals([]);
    setShowClearModal(false);
    setPassword("");
    setLoadingClear(false);
    }

    async function restoreGoal(historyId: string) {
        if (!confirm("Restore this goal?")) return;

        const res = await fetch("/api/history/restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ historyId }),
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error);

        // // Refresh history
        setGoals(prev => prev.filter(g => g._id !== historyId));
    }


  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">📜 Historique des objectifs</h1>
        <button
        onClick={() => {
            setShowClearModal(true);
            setClearCode("");
            setClearMsg("");
            setClearErr("");
        }}
        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition"
        >
        🗑 Clear History
        </button>


        {loading && <p>Chargement...</p>}

        {!loading && goals.length === 0 && (
          <p className="text-gray-500">Aucun goal archivé</p>
        )}

        <div className="space-y-4">
          {goals.map(goal => (
            <div
              key={goal._id}
              className="bg-white dark:bg-[var(--card-bg)] p-5 rounded-xl shadow border-l-4 border-gray-400"
            >
              <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg">
                {goal.description}
            </h2>

            <div className="flex gap-2">
                <button
                onClick={() => restoreGoal(goal._id)}
                className="bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded-lg text-sm transition"
                >
                ♻ Restore
                </button>
                <button
                onClick={() => setSelectedGoal(goal)}
                className="mt-3 w-full bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg transition"
                >
                👁 Show details
                </button>
                

            </div>
            {showClearModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-[var(--card-bg)] w-full max-w-md rounded-xl shadow-lg p-6">

                <h2 className="text-xl font-bold mb-4 text-red-600">
                    ⚠️ Clear History
                </h2>

                <p className="text-sm text-gray-600 mb-4">
                    Veuillez entrer votre mot de passe pour confirmer la suppression
                    complète de l’historique.
                </p>

                {error && (
                    <p className="mb-3 text-sm text-red-600 bg-red-100 px-3 py-2 rounded">
                    {error}
                    </p>
                )}

                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded mb-4"
                />

                <div className="flex justify-end gap-3">
                    <button
                    onClick={() => {
                        setShowClearModal(false);
                        setPassword("");
                        setError("");
                    }}
                    className="px-4 py-2 bg-gray-300 rounded"
                    >
                    Cancel
                    </button>

                    <button
                    disabled={loadingClear}
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded"
                    >
                    {loadingClear ? "Suppression..." : "Confirm"}
                    </button>
                </div>
                </div>
            </div>
            )}

        </div>


              <p className="text-sm text-gray-600 mt-1">
                Type : {goal.goalType}
              </p>

              <p className="text-sm mt-2">
                Progression : {goal.progress?.toFixed(1)} %
              </p>

              <span className="inline-block mt-3 px-3 py-1 text-xs rounded bg-gray-200">
                {goal.status}
              </span>
              

            </div>
          ))}
        </div>
      </div>
      {selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[var(--card-bg)] w-full max-w-lg rounded-xl shadow-lg p-6 relative">

                {/* Close */}
                <button
                    onClick={() => setSelectedGoal(null)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    📄 Goal Details
                </h2>

                <div className="space-y-2 text-sm">
                    <p><b>Description:</b> {selectedGoal.description}</p>
                    <p><b>Type:</b> {selectedGoal.goalType}</p>
                    <p><b>Status:</b> {selectedGoal.status}</p>
                    <p><b>Progress:</b> {selectedGoal.progress?.toFixed(1)} %</p>
                    <p><b>Archived at:</b> {new Date(selectedGoal.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="mt-6 text-right">
                    <button
                    onClick={() => setSelectedGoal(null)}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
                    >
                    Close
                    </button>
                </div>
            </div>
        </div>
      )}
      

      {showClearModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-[var(--card-bg)] p-6 rounded-xl w-full max-w-md shadow-xl">
          <h2 className="text-xl font-bold mb-2 text-red-600">⚠ Clear History</h2>
          <p className="text-sm text-gray-600 mb-4">
            Un code sera envoyé par email pour confirmer.
          </p>

          {clearErr && <p className="text-sm text-red-600 mb-3">{clearErr}</p>}
          {clearMsg && <p className="text-sm text-green-600 mb-3">{clearMsg}</p>}

          <button
            onClick={requestClearCode}
            disabled={sending}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg mb-4 disabled:opacity-60"
          >
            {sending ? "Envoi..." : "📩 Envoyer le code"}
          </button>

          <input
            type="text"
            placeholder="Code reçu par email"
            value={clearCode}
            onChange={(e) => setClearCode(e.target.value)}
            className="w-full px-4 py-2 border rounded mb-4"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowClearModal(false)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Annuler
            </button>

            <button
              onClick={confirmClearHistory}
              disabled={clearing || clearCode.trim().length !== 6}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
            >
              {clearing ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    )}


    </>
  );
}
