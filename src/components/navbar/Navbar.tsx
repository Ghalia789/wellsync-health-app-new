"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import DarkModeToggle from "../buttons/DarkModeToggle";

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Add styles for navbar links underline
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .navbar-link::after {
        background-color: var(--navbar-link-underline) !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <nav className="bg-[var(--mint-300)] text-white shadow-md font-[var(--font-poppins)]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo_WellSync_clear.png"
            alt="WellSync Logo"
            width={150}
            height={60}
            className="rounded-full bg-amber-50"
          />
        
        </div>

        {/* Links */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center space-x-8 font-medium">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/history", label: "History", icon: <Clock size={16} /> },
              { href: "/goals", label: "Goals", icon: <TrendingUp size={16} /> },
              { href: "/tips", label: "Tips", icon: <BookOpen size={16} /> },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  relative flex items-center gap-1
                  text-white/90 hover:text-white
                  transition-colors duration-300
                  after:absolute after:left-0 after:-bottom-1
                  after:h-[2px] after:w-0
                  after:bg-white
                  after:transition-all after:duration-300
                  hover:after:w-full
                "
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}


        {/* Toggle */}
        <div className="hidden md:flex">
          <DarkModeToggle />
        </div>
        {/* User section */}
        {!isLoggedIn ? (
          <Link
            href="/login"
            className="
    group
    relative px-4 py-2 rounded-full font-medium
    bg-white text-(--mint-500)
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
      bg-(--mint-600)
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
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors duration-300"
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--mint-600)',
                borderColor: 'transparent'
              }}
            >
              {session?.user?.name ?? "Account"}
              <ChevronDown size={16} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 shadow-lg rounded-lg py-2" style={{
                backgroundColor: 'var(--dropdown-bg)',
                color: 'var(--dropdown-text)'
              }}>
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
                    className="flex items-center gap-2 px-4 py-2 transition-colors duration-300"
                    style={{
                      color: 'var(--dropdown-text)'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--dropdown-hover-bg)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--dropdown-hover-text)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--dropdown-text)';
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 transition-colors duration-300"
                  style={{
                    color: 'var(--red-400)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--red-300)';
                    (e.currentTarget as HTMLElement).style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--red-400)';
                  }}
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
