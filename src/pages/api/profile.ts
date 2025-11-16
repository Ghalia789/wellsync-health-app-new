/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import connectMongo from "../../../utils/db";
import UserProfile from "@/models/UserProfile";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (session.user as any).id;

  await connectMongo();

  if (req.method === "GET") {
    // Fetch user profile
    try {
      const profile = await UserProfile.findOne({ idUser: userId });

      if (!profile) {
        return res.status(404).json({ message: "No profile found", profile: null });
      }

      return res.status(200).json({ profile });
    } catch (error: any) {
      console.error("❌ Error fetching profile:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  if (req.method === "POST") {
    // Create a new profile
    try {
      const existingProfile = await UserProfile.findOne({ idUser: userId });

      if (existingProfile) {
        return res.status(400).json({ error: "Profile already exists" });
      }

      const { birthDate, height, weight } = req.body;

      const newProfile = new UserProfile({
        idUser: userId,
        birthDate: birthDate ? new Date(birthDate) : null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
      });

      await newProfile.save();

      return res.status(201).json({
        message: "✅ Profile created successfully",
        profile: newProfile,
      });
    } catch (error: any) {
      console.error("❌ Error creating profile:", error);
      return res.status(500).json({ error: "Failed to create profile" });
    }
  }

  if (req.method === "PUT") {
    // Update existing profile
    try {
      const { birthDate, height, weight } = req.body;

      const updatedProfile = await UserProfile.findOneAndUpdate(
        { idUser: userId },
        {
          birthDate: birthDate ? new Date(birthDate) : null,
          height: height ? Number(height) : null,
          weight: weight ? Number(weight) : null,
        },
        { new: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.status(200).json({
        message: "✅ Profile updated successfully",
        profile: updatedProfile,
      });
    } catch (error: any) {
      console.error("❌ Error updating profile:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
