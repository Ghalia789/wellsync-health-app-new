/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import connectMongo from "../../../utils/db";
import mongoose from "mongoose";
import Measure from "@/models/Measure";
import UserProfile from "@/models/UserProfile";

// Normalize units to canonical storage units per type
function normalizeUnit(type: string, value: number, unit?: string) {
  const u = (unit || "").toLowerCase();

  switch ((type || "").toLowerCase()) {
    case "weight": {
      // canonical: kg
      if (!u || u === "kg" || u === "kilogram" || u === "kilograms") return { value, unit: "kg" };
      if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds") {
        return { value: Number(value) * 0.45359237, unit: "kg" };
      }
      return { value, unit: unit || "kg" };
    }

    case "height": {
      // canonical: cm
      if (!u || u === "cm" || u === "centimeter" || u === "centimeters") return { value, unit: "cm" };
      if (u === "m" || u === "meter" || u === "meters") return { value: Number(value) * 100, unit: "cm" };
      if (u === "in" || u === "inch" || u === "inches") return { value: Number(value) * 2.54, unit: "cm" };
      if (u === "ft" || u === "feet") return { value: Number(value) * 30.48, unit: "cm" };
      return { value, unit: unit || "cm" };
    }

    case "blood_pressure":
    case "blood-pressure":
    case "bp": {
      // canonical: mmHg
      if (!u || u === "mmhg") return { value, unit: "mmHg" };
      if (u === "kpa") return { value: Number(value) * 7.50062, unit: "mmHg" };
      return { value, unit: unit || "mmHg" };
    }

    case "glucose": {
      // canonical: mg/dL
      if (!u || u === "mg/dl" || u === "mg/dl") return { value, unit: "mg/dL" };
      if (u === "mmol/l" || u === "mmol") return { value: Number(value) * 18, unit: "mg/dL" };
      return { value, unit: unit || "mg/dL" };
    }

    default:
      return { value, unit: unit || "" };
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
    if (req.method === "GET") {
      // If ?summary=true return a simple aggregation (avg per day for a type)
      if (req.query.summary === "true") {
        const type = typeof req.query.type === "string" ? req.query.type : undefined;
        const match: any = { idUser: new mongoose.Types.ObjectId(userId) };
        if (type) match.type = type;

        const pipeline = [
          { $match: match },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              avgValue: { $avg: "$value" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 as const } },
        ] as const;

        const summary = await Measure.aggregate(pipeline as any);
        return res.status(200).json({ summary });
      }

      // Normal list
      const q: any = { idUser: userId };
      if (req.query.type) q.type = String(req.query.type);
      const limit = parseInt(String(req.query.limit || "50"), 10);

      const measures = await Measure.find(q).sort({ timestamp: -1 }).limit(limit);
      return res.status(200).json({ measures });
    }

    if (req.method === "POST") {
      const { type, value, unit, timestamp, notes } = req.body;

      if (!type || value === undefined || value === null) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Normalize to canonical unit before saving
      const normalized = normalizeUnit(String(type), Number(value), unit ? String(unit) : undefined);

      const m = new Measure({
        idUser: userId,
        type: String(type),
        value: normalized.value,
        unit: normalized.unit,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        notes: notes ? String(notes) : "",
      });

      await m.save();

      // If this is a weight or height measure, update or create the user's profile
      try {
        const t = String(type).toLowerCase();
        if (t === "weight") {
          // ensure profile exists and update weight (canonical unit)
          await UserProfile.findOneAndUpdate(
            { idUser: userId },
            { weight: normalized.value, updatedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        } else if (t === "height") {
          // update height (canonical unit: cm)
          await UserProfile.findOneAndUpdate(
            { idUser: userId },
            { height: normalized.value, updatedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
      } catch (profileErr) {
        console.error("❌ Failed updating user profile (weight/height):", profileErr);
      }

      return res.status(201).json({ message: "Measure created", measure: m });
    }

    if (req.method === "PUT") {
      const { id, type, value, unit, timestamp, notes } = req.body;

      if (!id) return res.status(400).json({ error: "Missing id for update" });

  const updatePayload: any = {};
      if (type) updatePayload.type = String(type);
      if (timestamp) updatePayload.timestamp = new Date(timestamp);
      if (notes !== undefined) updatePayload.notes = String(notes);

      if (value !== undefined) {
        // Normalize value+unit if type or unit provided
        const normalized = normalizeUnit(String(type || updatePayload.type || ""), Number(value), unit ? String(unit) : undefined);
        updatePayload.value = normalized.value;
        updatePayload.unit = normalized.unit;
      } else if (unit) {
        // only unit changed; attempt to convert current stored value to new canonical unit
        const existing = await Measure.findOne({ _id: id, idUser: userId });
        if (existing) {
          const normalized = normalizeUnit(String(type || existing.type || ""), Number(existing.value), String(unit));
          updatePayload.value = normalized.value;
          updatePayload.unit = normalized.unit;
        }
      }

      const updated = await Measure.findOneAndUpdate(
        { _id: id, idUser: userId },
        updatePayload,
        { new: true }
      );

      if (!updated) return res.status(404).json({ error: "Measure not found" });

      // If the updated measure is weight or height, reflect it in the user's profile
      try {
        const t = String(updated.type).toLowerCase();
        if (t === "weight") {
          await UserProfile.findOneAndUpdate(
            { idUser: userId },
            { weight: updated.value, updatedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        } else if (t === "height") {
          await UserProfile.findOneAndUpdate(
            { idUser: userId },
            { height: updated.value, updatedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
      } catch (profileErr) {
        console.error("❌ Failed updating user profile after measure update:", profileErr);
      }

      return res.status(200).json({ message: "Updated", measure: updated });
    }

    if (req.method === "DELETE") {
      const id = (req.query.id as string) || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: "Missing id to delete" });

      const deleted = await Measure.findOneAndDelete({ _id: id, idUser: userId });
      if (!deleted) return res.status(404).json({ error: "Measure not found" });

      // If the deleted measure is weight or height, recalc profile value from previous latest
      try {
        const t = String(deleted.type).toLowerCase();
        if (t === "weight" || t === "height") {
          // find previous latest measure of same type for user
          const prev = await Measure.findOne({ idUser: userId, type: deleted.type }).sort({ timestamp: -1 }).limit(1);

          if (prev) {
            // update profile with previous canonical value
            const update: any = { updatedAt: new Date() };
            if (t === "weight") update.weight = prev.value;
            if (t === "height") update.height = prev.value;

            await UserProfile.findOneAndUpdate({ idUser: userId }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
          } else {
            // no previous measure: clear the profile field
            const unset: any = {};
            if (t === "weight") unset.weight = "";
            if (t === "height") unset.height = "";
            // Use $unset to remove the field
            await UserProfile.findOneAndUpdate(
              { idUser: userId },
              { $unset: unset, $set: { updatedAt: new Date() } },
              { new: true }
            );
          }
        }
      } catch (profileErr) {
        console.error("❌ Failed recalculating user profile after measure delete:", profileErr);
      }

      return res.status(200).json({ message: "Deleted", id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("❌ Measures API error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
