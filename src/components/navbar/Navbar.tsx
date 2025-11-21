"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

import {
  ChevronDown,
  User,
  LogOut,
  Settings,
  TrendingUp,
  BookOpen,
  Clock,
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="bg-[var(--mint-500)] text-white shadow-md font-[var(--font-poppins)]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo_WellSync.png"
            alt="WellSync Logo"
            width={40}
            height={40}
            className="rounded-full w-10 h-10"
          />
          <span className="font-semibold text-lg tracking-wide">
            WellSync Health
          </span>
        </div>

        {/* Links */}
        {isLoggedIn && (
          <div className="hidden md:flex space-x-8 font-medium">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/history", label: "History", icon: <Clock size={16} /> },
              {
                href: "/goals",
                label: "Goals",
                icon: <TrendingUp size={16} />,
              },
              { href: "/tips", label: "Tips", icon: <BookOpen size={16} /> },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-1 text-white/90 hover:text-white transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[var(--mint-100)] after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* User section */}
        {!isLoggedIn ? (
          <Link
            href="/login"
            className="
    group
    relative px-4 py-2 rounded-full font-medium
    bg-white text-[var(--mint-500)]
    overflow-hidden
    transition-colors duration-300
  "
          >
            {/* TEXTE (toujours au-dessus) */}
            <span className="relative z-10 transition-colors duration-300">
              Sign In
            </span>

            {/* FOND ANIMÉ AU HOVER (derrière le texte) */}
            <span
              className="
      absolute inset-0
      bg-[var(--mint-600)]
      scale-x-0
      origin-left
      transition-transform duration-300
      ease-out
      group-hover:scale-x-100
    "
            ></span>
          </Link>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-white text-[var(--mint-600)] hover:bg-[var(--mint-100)] hover:text-white transition-colors duration-300"
            >
              {session?.user?.name ?? "Account"}
              <ChevronDown size={16} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg text-gray-800 py-2">
                {[
                  {
                    href: "/profile",
                    label: "Profile",
                    icon: <User size={16} />,
                  },
                  {
                    href: "/settings",
                    label: "Settings",
                    icon: <Settings size={16} />,
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--mint-100)] hover:text-white transition-colors duration-300"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-[var(--indian-red-300)] hover:text-white transition-colors duration-300 text-red-600"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
