import type { NextApiRequest, NextApiResponse } from "next";
import connectMongo from "../../../../utils/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getSession } from "next-auth/react";

const ADMIN_EMAIL = "admin@wellsync.com";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { email, password } = req.body;

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectMongo();
    const admin = await User.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: admin.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      token,
      isAdmin: true
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
