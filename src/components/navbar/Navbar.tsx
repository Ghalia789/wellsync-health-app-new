"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SignInButton from "../buttons/SignInButton";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <nav className="bg-[var(--mint-500)] text-white shadow-md font-[var(--font-poppins)]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo_WellSync.png"
            alt="WellSync Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="font-semibold text-lg tracking-wide">
            WellSync Health
          </span>
        </div>

        {/* Center: Nav links */}
        {isLoggedIn && (
          <div className="hidden md:flex space-x-6 text-[var(--mint-900)]">
            <Link href="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/appointments" className="hover:text-white transition">
              Appointments
            </Link>
            <Link href="/profile" className="hover:text-white transition">
              Profile
            </Link>
          </div>
        )}

        {/* Right: Sign-in or Logout */}
        <div>
          {!isLoggedIn ? (
            <SignInButton />
          ) : (
            <button
              onClick={() => setIsLoggedIn(false)}
              className="bg-white text-[var(--mint-500)] font-medium px-4 py-2 rounded-full hover:bg-[var(--mint-800)] transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
