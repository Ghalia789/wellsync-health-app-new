import Image from "next/image";
import { Poppins, Nunito } from "next/font/google";
import Navbar from "@/components/navbar/Navbar";

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
      <Navbar /> {/* ✅ Navbar at top */}
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the index.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Welcome to Wellsync Health — your personal health tracker for balance
            and wellbeing.
          </p>
        </div>
      </main>
    </div>
  );
}

