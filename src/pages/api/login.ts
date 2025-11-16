// /* eslint-disable @typescript-eslint/no-explicit-any */
// import type { NextApiRequest, NextApiResponse } from "next";
// import connectMongo from "../../../utils/db";
// import User from "@/models/User";
// import bcrypt from "bcrypt";
 
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Méthode non autorisée" });
//   }
 
//   try {
//     await connectMongo();
 
//     const { email, password } = req.body;
 
//     if (!email || !password) {
//       return res.status(400).json({ error: "Tous les champs sont requis." });
//     }
 
//     // ✅ Vérifier si l'utilisateur existe
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: "Adresse email introuvable." });
//     }
 
//     // ✅ Vérifier le mot de passe
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ error: "Mot de passe incorrect." });
//     }
 
//     // ✅ Déterminer la redirection selon la première connexion
//     const redirectUrl = user.profileImage ? "/dashboard" : "/dashboard";
//     // 🔹 tu peux aussi faire: const redirectUrl = user.profileImage ? "/dashboard" : "/first-login";
 
//     // ✅ Retourner l'utilisateur et la redirection
//     return res.status(200).json({
//       message: "Connexion réussie 🎉",
//       redirect: redirectUrl,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         profileImage: user.profileImage,
//         firstLogin: user.firstLogin, // ✅ ajoute ceci
//       },
//     });
//   } catch (error: any) {
//     console.error("❌ Login error:", error.message);
//     return res.status(500).json({ error: "Erreur serveur." });
//   }
// }