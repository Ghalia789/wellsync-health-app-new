
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface Props {
  onClose: () => void;
  onConfirmPassword: (password: string) => void;
  onGoogleConfirm: () => void;
}

export default function ClearHistoryModal({
  onClose,
  onConfirmPassword,
  onGoogleConfirm,
}: Props) {
  const { data: session } = useSession();
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[var(--card-bg)] p-6 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          ⚠ Supprimer tout l’historique
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Cette action est irréversible.
        </p>

        {/* 🔥 ICI TON CODE */}
        {session?.user?.isGoogleUser ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Votre compte est lié à Google.
              Veuillez confirmer votre identité.
            </p>

            <button
              onClick={onGoogleConfirm}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg"
            >
              🔐 Confirmer avec Google
            </button>
          </div>
        ) : (
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded mb-4"
          />
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Annuler
          </button>

          {!session?.user?.isGoogleUser && (
            <button
              onClick={() => onConfirmPassword(password)}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
