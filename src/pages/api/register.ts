/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import connectMongo from "../../../utils/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import axios from "axios";
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }
 
  try {
    await connectMongo();
 
    const { username, email, password } = req.body;
 
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }
 
    // ✅ Vérifier la présence de la clé API Abstract
    if (!process.env.ABSTRACT_API_KEY) {
      console.error("❌ ABSTRACT_API_KEY manquante dans .env.local");
      return res
        .status(500)
        .json({ error: "Configuration serveur incomplète" });
    }
 
    // ✅ Étape 1 : Vérification email via Abstract API
    const apiUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${email}`;
    let data;
    try {
      const response = await axios.get(apiUrl);
      data = response.data;
    } catch (apiErr: any) {
      console.error("⚠️ Erreur Abstract API :", apiErr.message);
      return res.status(502).json({ error: "Échec de validation de l'email" });
    }
 
    // 🧩 Vérifications progressives
    if (!data.is_valid_format?.value)
      return res.status(400).json({ error: "Format d'adresse email invalide" });
 
    if (!data.is_mx_found?.value)
      return res.status(400).json({ error: "Domaine de messagerie invalide" });
 
    if (data.is_smtp_valid?.value === false)
      return res.status(400).json({ error: "Adresse email inexistante" });
 
    // ✅ Étape 2 : Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email déjà enregistré" });
    }
 
    // ✅ Étape 3 : Hash du mot de passe et création du compte
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const newUser = new User({
      name: username,
      email,
      password: hashedPassword,
      role: "user",
      profileImage: "",
      firstLogin: true,
    });
 
    await newUser.save();
 
    return res.status(201).json({
      message: "🎉 Utilisateur créé avec succès",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileImage: newUser.profileImage,
      },
    });
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}