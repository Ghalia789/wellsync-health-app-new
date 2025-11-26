/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import connectMongo from "../../../utils/db";
import Goal from "@/models/Goal";
import Measure from "@/models/Measure";
import mongoose from "mongoose";
import { getMeasureTypesForGoalType } from "../../../utils/goalMeasureMap";

function computeProgress(current: number, target: number, type: string) {
  if (!target) return 0;

  switch (type) {
    case "WEIGHT_LOSS":
    case "STRESS_REDUCTION":
      return Math.min(100, Math.max(0, ((current - target) / current) * 100));

    default:
      return Math.min(100, Math.max(0, (current / target) * 100));
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (session.user as any).id;
  await connectMongo();

  try {
    /* ------------------------ GET GOALS ------------------------ */
    if (req.method === "GET") {
      const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

      const result = [];

      for (const goal of goals) {
        const types = getMeasureTypesForGoalType(goal.type);

        const measures = await Measure.find({
          idUser: userId,
          type: { $in: types },
          timestamp: {
            $gte: goal.startDate,
            $lte: goal.endDate,
          }
        }).sort({ timestamp: 1 });

        const latest = measures.length ? measures[measures.length - 1] : null;

        const currentValue = latest ? latest.value : 0;
        const progress = computeProgress(currentValue, goal.targetValue, goal.type);

        // attach computed values
        result.push({
          ...goal.toObject(),
          measures,
          currentValue,
          progress,
        });
      }

      return res.status(200).json({ goals: result });
    }

    /* ------------------------ CREATE GOAL ------------------------ */
    if (req.method === "POST") {
      const { type, description, startDate, endDate, targetValue } = req.body;

      if (!type || !description || !startDate || !endDate || targetValue === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
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

    /* ------------------------ UPDATE GOAL ------------------------ */
    if (req.method === "PUT") {
      const { id, ...updates } = req.body;

      if (!id) return res.status(400).json({ error: "Missing id" });

      const updated = await Goal.findOneAndUpdate(
        { _id: id, userId },
        updates,
        { new: true }
      );

      if (!updated) return res.status(404).json({ error: "Goal not found" });

      return res.status(200).json({ message: "Goal updated", goal: updated });
    }

    /* ------------------------ DELETE GOAL ------------------------ */
    if (req.method === "DELETE") {
      const id = (req.query.id as string) || req.body.id;

      if (!id) return res.status(400).json({ error: "Missing id" });

      const deleted = await Goal.findOneAndDelete({ _id: id, userId });

      if (!deleted) return res.status(404).json({ error: "Goal not found" });

      return res.status(200).json({ message: "Goal deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("❌ Goals API error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
