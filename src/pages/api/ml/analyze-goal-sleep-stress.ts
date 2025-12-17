/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectMongo from "../../../../utils/db";
import Measure from "@/models/Measure";
import Goal from "@/models/Goal";

const ML_API_BASE = process.env.ML_API_URL || "http://localhost:5000";

// Define TypeScript interfaces
interface GoalDocument {
  _id: any;
  userId: any;
  type: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetValue: number;
  currentValue?: number;
  progress?: number;
  __v?: number;
}

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
 * Endpoint: POST /api/ml/analyze-goal-sleep-stress
 * Analyze a specific sleep or stress goal with detailed insights
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (session.user as any).id;

  try {
    await connectMongo();

    const { goalId } = req.body;

    if (!goalId) {
      return res.status(400).json({ error: "Goal ID is required" });
    }

    // Fetch the specific goal
    const goal = await Goal.findOne({ 
      _id: goalId, 
      userId: userId 
    }).lean<GoalDocument>();

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    // Check if it's a sleep or stress goal
    if (goal.type !== "SLEEP_IMPROVEMENT" && goal.type !== "STRESS_REDUCTION") {
      return res.status(400).json({ 
        error: "This endpoint only supports SLEEP_IMPROVEMENT and STRESS_REDUCTION goals",
        goal_type: goal.type
      });
    }

    // Fetch measures within goal timeframe
    const measures = await Measure.find({
      idUser: userId,
      timestamp: { 
        $gte: new Date(goal.startDate),
        $lte: new Date(goal.endDate) 
      }
    }).sort({ timestamp: -1 }).lean<MeasureDocument[]>();

    if (!measures || measures.length === 0) {
      return res.status(400).json({ 
        error: "No measures found for this goal period",
        goal_type: goal.type,
        period: {
          start: goal.startDate,
          end: goal.endDate
        }
      });
    }

    // Prepare payload for goal-specific sleep-stress analysis
    const mlPayload = {
      goal: {
        _id: goal._id.toString(),
        userId: goal.userId.toString(),
        type: goal.type,
        description: goal.description,
        startDate: goal.startDate,
        endDate: goal.endDate,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue || 0,
        progress: goal.progress || 0
      },
      measures: measures.map((m: MeasureDocument) => ({
        idUser: m.idUser?.toString() || userId,
        type: m.type,
        value: m.value,
        unit: m.unit,
        timestamp: m.timestamp,
        metadata: m.metadata || {},
        notes: m.notes || '',
      }))
    };

    // Call ML API goal-specific sleep-stress endpoint
    const response = await fetch(`${ML_API_BASE}/api/ml/analyze-goal-sleep-stress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mlPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Calculate progress based on goal type and current data
    let calculatedProgress = 0;
    let currentValue = 0;
    
    if (goal.type === "SLEEP_IMPROVEMENT") {
      // Find latest sleep_score
      const sleepScores = measures
        .filter((m: MeasureDocument) => m.type === "sleep_score")
        .map((m: MeasureDocument) => m.value);
      
      if (sleepScores.length > 0) {
        currentValue = sleepScores[0]; // Most recent
        calculatedProgress = Math.min(100, Math.max(0, (currentValue / goal.targetValue) * 100));
      }
    } else if (goal.type === "STRESS_REDUCTION") {
      // Find latest stress_score
      const stressScores = measures
        .filter((m: MeasureDocument) => m.type === "stress_score")
        .map((m: MeasureDocument) => m.value);
      
      if (stressScores.length > 0) {
        currentValue = stressScores[0];
        // For stress reduction, lower is better
        if (goal.targetValue < currentValue) {
          const improvement = currentValue - goal.targetValue;
          const totalPossible = currentValue; // Starting from current
          calculatedProgress = Math.min(100, Math.max(0, (improvement / totalPossible) * 100));
        } else {
          calculatedProgress = 100; // Already at or below target
        }
      }
    }

    // Enhanced response
    const enhancedResponse = {
      ...data,
      goal_summary: {
        goal_id: goal._id.toString(),
        goal_type: goal.type,
        goal_description: goal.description,
        target_value: goal.targetValue,
        current_value: currentValue,
        calculated_progress: Math.round(calculatedProgress * 10) / 10,
        measures_used: measures.length,
        analysis_period: {
          start: goal.startDate,
          end: goal.endDate,
          days: Math.ceil((new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24))
        }
      },
      user_id: userId,
      analysis_timestamp: new Date().toISOString()
    };

    return res.status(200).json(enhancedResponse);
    
  } catch (error: any) {
    console.error("❌ Goal Sleep-Stress Analysis error:", error);
    return res.status(500).json({
      error: "Goal sleep-stress analysis failed",
      details: error.message,
    });
  }
}