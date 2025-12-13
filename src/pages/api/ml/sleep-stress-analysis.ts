/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "../../../../utils/db";
import Measure from "@/models/Measure";

const ML_API_BASE = process.env.ML_API_URL || "http://localhost:5000";

// Define TypeScript interfaces
interface MeasureDocument {
  _id: any;
  idUser: any;
  type: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: any;
  notes?: string;
  __v?: number;
}

/**
 * Endpoint: GET/POST /api/ml/sleep-stress-analysis
 * Get sleep-stress analysis without requiring goals
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (session.user as any).id;

  try {
    await connectMongo();

    // Get timeframe from query or body
    const timeframe = req.method === "GET" 
      ? parseInt(req.query.timeframe as string) || 30
      : req.body.timeframe || 30;

    // Get analysis type
    const analysisType = req.method === "GET"
      ? (req.query.analysis_type as string) || "all"
      : req.body.analysis_type || "all";

    // Fetch measures
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);

    const measures = await Measure.find({ 
      idUser: userId,
      timestamp: { $gte: cutoffDate }
    }).sort({ timestamp: -1 }).lean<MeasureDocument[]>();

    if (!measures || measures.length === 0) {
      return res.status(400).json({ 
        error: "No measures found in the specified timeframe",
        timeframe: timeframe
      });
    }

    // Prepare payload for sleep-stress analysis
    const mlPayload = {
      measures: measures.map((m: MeasureDocument) => ({
        idUser: m.idUser?.toString() || userId,
        type: m.type,
        value: m.value,
        unit: m.unit,
        timestamp: m.timestamp,
        metadata: m.metadata || {},
        notes: m.notes || '',
      })),
      analysis_type: analysisType,
      timeframe: timeframe
    };

    // Call ML API sleep-stress endpoint
    const response = await fetch(`${ML_API_BASE}/api/ml/sleep-stress-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mlPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Enhance response
    const enhancedResponse = {
      ...data,
      user_id: userId,
      timeframe_days: timeframe,
      local_timestamp: new Date().toISOString(),
      measures_analyzed: measures.length,
      sleep_stress_measures_count: measures.filter((m: MeasureDocument) => 
        ["sleep_score", "stress_score", "sleep_duration", "sleep_quality", "stress_level", "sleep_efficiency", "stress_health"].includes(m.type)
      ).length
    };

    return res.status(200).json(enhancedResponse);
    
  } catch (error: any) {
    console.error("❌ Sleep-Stress Analysis error:", error);
    return res.status(500).json({
      error: "Sleep-stress analysis failed",
      details: error.message,
    });
  }
}