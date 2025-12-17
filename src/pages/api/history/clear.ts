import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "../../../../utils/db";
import GoalHistory from "@/models/GoalHistory";
import User from "@/models/User";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  await connectMongo();

  const user = await User.findById((session.user as any).id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: "Mot de passe incorrect" });
  }

  await GoalHistory.deleteMany({ userId: user._id.toString() });

  return res.status(200).json({ message: "History cleared" });
}
