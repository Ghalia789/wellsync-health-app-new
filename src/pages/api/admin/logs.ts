import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "../../../../utils/db";
import IALog from "@/models/IALog";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!(session?.user as any)?.isAdmin) {
  return res.status(403).json({ message: "Forbidden" });
}

  await connectMongo();

  const logs = await (IALog as any)
    .find()
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(200).json(logs); // logs = []

}