/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "../../../../utils/db";
import ClearHistoryToken from "@/models/ClearHistoryToken";
import { sendMail } from "../../../../utils/mailer";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await connectMongo();

    const userId = (session.user as any).id;
    const email = session.user.email as string;

    if (!email) return res.status(400).json({ error: "No email in session" });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Supprimer ancien code
    await ClearHistoryToken.deleteMany({ userId });

    // Sauvegarder le nouveau
    await ClearHistoryToken.create({ userId, code, expiresAt });

    // Envoyer email
    await sendMail(
      email,
      "WellSync - Code de confirmation",
      `Votre code de confirmation WellSync est : ${code}\nIl est valable 10 minutes.`
    );

    return res.status(200).json({ message: "Code sent" });
  } catch (err: any) {
    console.error("request-clear error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
