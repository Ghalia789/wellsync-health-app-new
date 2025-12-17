/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "../../../../utils/db";
import ClearHistoryToken from "@/models/ClearHistoryToken";
import GoalHistory from "@/models/GoalHistory";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await connectMongo();

    const userId = (session.user as any).id;
    const { code } = req.body;

    if (!code) return res.status(400).json({ error: "Missing code" });

    const token = await ClearHistoryToken.findOne({ userId, code });

    if (!token) return res.status(400).json({ error: "Invalid code" });

    if (new Date(token.expiresAt).getTime() < Date.now()) {
      await ClearHistoryToken.deleteMany({ userId });
      return res.status(400).json({ error: "Code expired" });
    }

    // Supprimer l'historique
    await GoalHistory.deleteMany({ userId });

    // Nettoyer token
    await ClearHistoryToken.deleteMany({ userId });

    return res.status(200).json({ message: "History cleared" });
  } catch (err: any) {
    console.error("confirm-clear error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
