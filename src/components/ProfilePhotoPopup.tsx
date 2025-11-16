"use client";
import { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
 
export default function ProfilePhotoPopup() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
 
  // 🎥 Ouvrir la caméra dans le popup
  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraOn(true);
 
      // 🧩 Attendre le prochain rendu React pour être sûr que <video> est dans le DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
 
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current!.play();
              console.log("🎥 Flux caméra démarré !");
            } catch (playErr) {
              console.warn("⚠️ Échec du démarrage de la vidéo :", playErr);
            }
          };
        }
      }, 100); // petit délai pour laisser React afficher le <video>
    } catch (err) {
      console.error("Erreur caméra :", err);
      toast.error("Impossible d'accéder à la caméra 😢");
    }
  };
 
  // 📸 Capturer l'image depuis la vidéo
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setImage(dataUrl);
    setCameraOn(false);
 
    // stoppe la caméra
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
  };
 
  // 📂 Sélectionner un fichier local
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };
 
  // 💾 Envoyer l'image vers l'API upload-profile
  const handleConfirm = async () => {
    if (!image) return toast.error("Veuillez d’abord choisir une image !");
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], "profile.png", { type: "image/png" });
 
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("userId", user.id);
 
      await axios.post("/api/upload-profile", formData);
      toast.success("✅ Photo enregistrée avec succès !");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, profileImage: "uploaded" })
      );
      window.location.reload();
    } catch {
      toast.error("Erreur lors de l’envoi de la photo.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[360px] text-center shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          Ajoute ta photo de profil
        </h2>
 
        {/* 🟢 Zone d'affichage */}
        <div
          onClick={() => !cameraOn && fileInputRef.current?.click()}
          className="mx-auto mb-4 w-36 h-36 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-50 transition"
        >
          {cameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: 250, height: 250, borderRadius: "50%" }}
            />
          ) : image ? (
            <img
              src={image}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-gray-400 text-sm text-center">
              Clique ici
              <br />
              pour choisir
            </span>
          )}
        </div>
 
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
 
        {/* Boutons caméra */}
        {!cameraOn ? (
          <button
            onClick={handleOpenCamera}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-5 transition"
          >
            Ouvrir la caméra
          </button>
        ) : (
          <button
            onClick={handleCapturePhoto}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mb-5 transition"
          >
            Capturer la photo
          </button>
        )}
 
        {/* Boutons confirmer / plus tard */}
        <div className="flex justify-between gap-3">
          <button
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
            onClick={() => window.location.reload()}
          >
            Plus tard
          </button>
          <button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Envoi..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
 