import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
 
  if (!session) {
    return res.status(401).json({ error: "Non autorisé : veuillez vous connecter." });
  }
 
  // ✅ Si session valide :
  return res.status(200).json({
    message: `Bienvenue ${session.user?.name || "utilisateur"} 👋`,
    email: session.user?.email,
  });
}