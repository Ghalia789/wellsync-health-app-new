/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import connectMongo from "../../../utils/db";
import User from "@/models/User";
 
export const config = {
  api: { bodyParser: false },
};
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }
 
  try {
    await connectMongo();
 
    const uploadDir = path.join(process.cwd(), "/public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
 
    const form = formidable({
      multiples: false,
      uploadDir,
      keepExtensions: true,
    });
 
    form.parse(req, async (err: any, fields: any, files: any) => {
      if (err) {
        console.error("❌ Formidable error:", err);
        return res
          .status(500)
          .json({ error: "Erreur lors du traitement du fichier" });
      }
 
      // ✅ Correction TypeScript : gérer string | string[]
      const userIdField = fields.userId;
      const userId = Array.isArray(userIdField) ? userIdField[0] : userIdField;
 
      // ✅ Correction TypeScript : gérer File | File[]
      const photoField = files.photo;
      const photo = Array.isArray(photoField) ? photoField[0] : photoField;
 
      if (!userId || !photo) {
        return res.status(400).json({ error: "Informations incomplètes" });
      }
 
      // ✅ Renommer et déplacer le fichier
      const newFilename = `${Date.now()}_${photo.originalFilename}`;
      const newPath = path.join(uploadDir, newFilename);
      fs.renameSync(photo.filepath, newPath);
 
      const imagePath = `/uploads/${newFilename}`;
 
      // ✅ Mise à jour MongoDB
      await User.findByIdAndUpdate(userId, {
        profileImage: imagePath,
        firstLogin: false,
      });
 
      console.log(`✅ Photo uploadée : ${imagePath}`);
 
      return res.status(200).json({
        message: "Photo enregistrée avec succès",
        imagePath,
      });
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error.message);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}