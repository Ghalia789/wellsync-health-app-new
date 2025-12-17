"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import { Lightbulb } from "lucide-react";
import tipsData from "@/data/tips.json";

type TipsData = {
  [category: string]: string[];
};

export default function TipsPage() {
  const [currentTip, setCurrentTip] = useState<string>("");

  const tips = tipsData as TipsData;

  const getRandomTip = () => {
    const categories = Object.keys(tips);
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const randomTip =
      tips[randomCategory][
        Math.floor(Math.random() * tips[randomCategory].length)
      ];
    setCurrentTip(randomTip);
  };

  useEffect(() => {
    getRandomTip();
    const interval = setInterval(getRandomTip, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
  <>
    <Navbar />

    <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl w-full text-center">

        {/* Card */}
        <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl px-10 py-14">

          {/* Icon */}
          <div className="flex justify-center mb-8 perspective-1000">
            <div className="relative w-20 h-20 transition-transform duration-700 transform-style-preserve-3d hover:rotate-y-180">
              
              {/* Front */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full 
                              bg-gradient-to-tr from-cyan-400 to-emerald-400 shadow-lg
                              backface-hidden">
                <Lightbulb size={40} className="text-slate-900" />
              </div>

              {/* Back */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full 
                              bg-gradient-to-tr from-emerald-400 to-cyan-400 shadow-xl
                              rotate-y-180 backface-hidden">
                <Lightbulb size={40} className="text-slate-900 opacity-80" />
              </div>

            </div>
          </div>


          {/* Tip text */}
          <p className="text-4xl md:text-5xl font-semibold leading-snug text-white tracking-wide">
            {currentTip}
          </p>

          {/* Subtitle */}
          <p className="mt-6 text-sm uppercase tracking-widest text-white/60">
            Daily wellness insight
          </p>
        </div>

      </div>
    </main>
  </>
);

}
