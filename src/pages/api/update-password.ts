/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import connectMongo from "../../../utils/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Données manquantes" });
    }

    await connectMongo();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // 🔒 Bloquer Google Auth
    if (user.password === "google-auth") {
      return res.status(403).json({
        message: "Compte Google : mot de passe géré par Google",
      });
    }

    // 🔐 Vérifier ancien mot de passe
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Ancien mot de passe incorrect" });
    }

    // 🔐 Nouveau hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur update-password:", error);
    return res
      .status(500)
      .json({ message: "Erreur interne du serveur" });
  }
}