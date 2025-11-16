/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import connectMongo from "../../../utils/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    await connectMongo();
    const { userId, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(userId, { password: hashed });

    return res.status(200).json({ message: "Mot de passe mis à jour" });
  } catch (err: any) {
    console.error("Erreur update-password:", err.message);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
