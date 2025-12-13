/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import connectMongo from "../../../utils/db";
import Goal from "@/models/Goal";
import Measure from "@/models/Measure";
import { getMeasureTypesForGoalType } from "../../../utils/goalMeasureMap";

function computeProgress(current: number, target: number, type: string) {
  if (!target || current === 0) return 0;

  switch (type) {
    case "WEIGHT_LOSS":
    case "STRESS_REDUCTION":
      // Progress = how close current is to lower target
      return Math.min(100, Math.max(0, ((current - target) / (current || 1)) * 100));
    case "SLEEP_IMPROVEMENT":
      // For sleep improvement: higher sleep_score = better progress
      // sleep_score: 0-100 (higher = better sleep)
      // target: desired sleep_score (higher value)
      return Math.min(100, Math.max(0, (current / target) * 100));
    
    case "MUSCLE_GAIN":
      // Higher weight = better progress
      return Math.min(100, Math.max(0, (current / target) * 100));
      
    case "HEART_HEALTH":
      // Lower blood pressure = better progress
      return Math.min(100, Math.max(0, ((target - current) / target) * 100));
      
    case "DIABETES_CONTROL":
      // Lower glucose = better progress
      return Math.min(100, Math.max(0, ((target - current) / target) * 100));

    default:
      // General case: increase toward target
      return Math.min(100, Math.max(0, (current / target) * 100));
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /* ------------------------- Auth Check -------------------------- */
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (session.user as any).id;

  await connectMongo();

  try {
    /* --------------------------- GET --------------------------- */
    if (req.method === "GET") {
      const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

      const enhancedGoals = [];

      for (const goal of goals) {
        const allowedTypes = getMeasureTypesForGoalType(goal.type);

        const measures = await Measure.find({
          idUser: userId,
          type: { $in: allowedTypes },
          timestamp: { $gte: goal.startDate, $lte: goal.endDate },
        }).sort({ timestamp: 1 });

        const latest = measures.length ? measures[measures.length - 1] : null;

        const currentValue = latest ? Number(latest.value) : 0;

        const progress = computeProgress(currentValue, goal.targetValue, goal.type);

        enhancedGoals.push({
          ...goal.toObject(),
          measures,
          currentValue,
          progress,
        });
      }

      return res.status(200).json({ goals: enhancedGoals });
    }

    /* --------------------------- POST --------------------------- */
    if (req.method === "POST") {
      const { type, description, startDate, endDate, targetValue } = req.body;

      if (!type || !description || !startDate || !endDate || targetValue === undefined) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const goal = await Goal.create({
        userId,
        type,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetValue,
      });

      return res.status(201).json({ message: "Goal created", goal });
    }

    /* --------------------------- PUT --------------------------- */
    if (req.method === "PUT") {
      const { id, ...updates } = req.body;

      if (!id) return res.status(400).json({ error: "Missing goal id" });

      const goal = await Goal.findOneAndUpdate(
        { _id: id, userId },
        updates,
        { new: true }
      );

      if (!goal) return res.status(404).json({ error: "Goal not found" });

      return res.status(200).json({ message: "Goal updated", goal });
    }

    /* -------------------------- DELETE -------------------------- */
    if (req.method === "DELETE") {
      const id = (req.query.id as string) || req.body.id;
      if (!id) return res.status(400).json({ error: "Missing goal id" });

      const deleted = await Goal.findOneAndDelete({ _id: id, userId });

      if (!deleted) return res.status(404).json({ error: "Goal not found" });

      return res.status(200).json({ message: "Goal deleted" });
    }

    /* ----------------------- Not Allowed ------------------------- */
    return res.status(405).json({ error: "Method not allowed" });

  } catch (err: any) {
    console.error("❌ Goals API Error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
