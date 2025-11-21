"use client";

import Navbar from "@/components/navbar/Navbar";
import { Poppins, Nunito } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function Home() {
  return (
    <div className={`${poppins.variable} ${nunito.variable} antialiased`}>
      {/* NAVBAR */}
      <Navbar />

      {/* SECTION 1 : HERO */}
      <section className="w-full bg-[#F3F7F4] flex items-center justify-center py-5 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
          {/* LOGO */}
          <img
            src="/Logo.png"
            alt="WellSync Logo"
            width={240}
            height={240}
            className="mb-2"
          />

          {/* Groupe texte + image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center ml-[175px]">
            {/* TEXTE */}
            <div className="flex flex-col justify-center text-left items-start">
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-3">
                Your Health, <br />
                Powered by AI.
              </h1>

              <p className="text-gray-600 max-w-md mb-2 leading-relaxed">
                WellSync provides personalized insights and smart tools to
                monitor your vitals, activity, and sleep. Achieve your wellness
                goals with intelligent recommendations tailored just for you.
              </p>
            </div>

            {/* IMAGE À DROITE */}
            <div className="flex justify-center md:justify-start items-center">
              <img
                src="/acceuil.png"
                alt="WellSync illustration"
                width={180}
                height={180}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
