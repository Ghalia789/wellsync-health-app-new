import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "../../../../utils/db";

import Goal from "@/models/Goal";
import GoalHistory from "@/models/GoalHistory";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user)
    return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { historyId } = req.body;
  if (!historyId)
    return res.status(400).json({ error: "Missing historyId" });

  await connectMongo();

  // 1️⃣ Trouver le goal archivé
  const archivedGoal = await GoalHistory.findOne({
    _id: historyId,
    userId: session.user.id,
  });

  if (!archivedGoal)
    return res.status(404).json({ error: "Archived goal not found" });

  // 2️⃣ Recréer un goal actif
  await Goal.create({
    userId: session.user.id,
    type: archivedGoal.goalType,
    description: archivedGoal.description,
    targetValue: archivedGoal.targetValue ?? 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
    status: "pending",
  });

  // 3️⃣ Supprimer de l’historique
  await GoalHistory.findByIdAndDelete(historyId);

  return res.status(200).json({ message: "Goal restored successfully" });
}
    