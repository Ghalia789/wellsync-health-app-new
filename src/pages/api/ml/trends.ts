/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "../../../../utils/db";
import Measure from "@/models/Measure";

const ML_API_BASE = process.env.ML_API_URL || "http://localhost:5000";

/**
 * Endpoint: POST /api/ml/trends
 * Predicts health trends based on user's measures
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = (session.user as any).id;

  try {
    await connectMongo();

    // Fetch user's measures
    const measures = await Measure.find({ idUser: userId })
      .sort({ timestamp: -1 })
      .limit(100);

    if (!measures || measures.length === 0) {
      return res.status(400).json({ error: "No measures found" });
    }

    // Prepare payload
    const mlPayload = {
      user_id: userId,
      measures: measures.map((m: any) => ({
        idUser: m.idUser?.toString() || userId,
        type: m.type,
        value: m.value,
        unit: m.unit,
        timestamp: m.timestamp,
        notes: m.notes,
      })),
    };

    // Call ML API
    const response = await fetch(`${ML_API_BASE}/api/ml/predict-trends`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mlPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("❌ ML Trends error:", error);
    return res.status(500).json({
      error: "Trend prediction failed",
      details: error.message,
    });
  }
}
