import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import connectMongo from "../../../utils/db";
import User from "@/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    await connectMongo();

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    if (user.password === "google-auth") {
      return res.status(400).json({
        message: "Compte Google : mot de passe géré par Google",
      });
    }


    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
