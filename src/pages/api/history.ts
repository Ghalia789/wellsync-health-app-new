import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import connectMongo from "../../../utils/db";
import GoalHistory from "@/models/GoalHistory";
import type { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  await connectMongo();

  const history = await GoalHistory.find({
    userId: session.user.id,
  }).sort({ createdAt: -1 });

  res.status(200).json({ history });
}
