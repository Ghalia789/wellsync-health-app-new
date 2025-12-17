/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "../../../../utils/db";
import Measure from "@/models/Measure";
import Goal from "@/models/Goal";

const ML_API_BASE = process.env.ML_API_URL || "http://localhost:5000";

/**
 * Endpoint: POST /api/ml/analyze-user
 * Analyzes user health data using ML models
 * Returns: anomalies, health_score, summary, trends, goals
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
  const userProfile = {
    name: session.user.name,
    email: session.user.email,
    generatedAt: new Date().toISOString(),
  };

  try {
    await connectMongo();

    // Fetch user's measures if not provided
    let measures = req.body.measures;
    if (!measures || measures.length === 0) {
      measures = await Measure.find({ idUser: userId }).sort({ timestamp: -1 }).limit(100);
    }

    // Fetch user's goals if not provided
    let goals = req.body.goals;
    if (!goals || goals.length === 0) {
      goals = await Goal.find({ userId }).lean();
    }

    if (!measures || measures.length === 0) {
      return res.status(400).json({ error: "No measures found for user" });
    }

    // Prepare payload for ML API
    const mlPayload = {
      measures: measures.map((m: any) => ({
        idUser: m.idUser?.toString() || userId,
        type: m.type,
        value: m.value,
        unit: m.unit,
        timestamp: m.timestamp,
        notes: m.notes,
      })),
      goals: goals.map((g: any) => ({
        _id: g._id?.toString(),
        userId: g.userId?.toString(),
        type: g.type,
        description: g.description,
        startDate: g.startDate,
        endDate: g.endDate,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        progress: g.progress,
      })),
      profile: userProfile,
    };

    // Call ML API
    const response = await fetch(`${ML_API_BASE}/api/ml/analyze-user`, {
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
    console.error("❌ ML Analyze User error:", error);
    return res.status(500).json({
      error: "Analysis failed",
      details: error.message,
    });
  }
}
