/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../utils/db";
import User from "@/models/User";
import { verifyToken } from "../utils/auth";
import { getToken } from "next-auth/jwt";
import { JwtPayload } from "jsonwebtoken";

export const withAuth = (
  handler: (req: NextApiRequest, res: NextApiResponse, user: any) => Promise<void> | void,
  requiredRoles: string[]
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await dbConnect();

      let user = null;

      // 🟢 1️⃣ Vérifie ton propre token JWT (issu de /api/login)
      const cookieToken = req.headers.cookie?.split("token=")[1];
      if (cookieToken) {
        const decoded = verifyToken(cookieToken) as JwtPayload;
        const userId = decoded.userId;

        if (!userId) {
          return res.status(401).json({ message: "Unauthorized: No user ID found in token." });
        }

        user = await User.findById(userId);
      }

      // 🟡 2️⃣ Sinon, essaie avec le token NextAuth (Google Auth)
      if (!user) {
        const nextAuthToken = await getToken({
          req,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (nextAuthToken && (nextAuthToken as any).user?.email) {
          const googleUser = await User.findOne({ email: (nextAuthToken as any).user.email });
          if (googleUser) {
            user = googleUser;
          }
        }
      }

      // 🔴 3️⃣ Aucun utilisateur trouvé → accès refusé
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token." });
      }

      // 🟣 4️⃣ Vérification du rôle
      if (!requiredRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions." });
      }

      // ✅ 5️⃣ Tout est bon → exécute le handler
      return handler(req, res, user);
    } catch (error: any) {
      console.error("❌ Auth Middleware Error:", error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  };
};
