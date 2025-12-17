"use client";

import { useRouter } from "next/navigation";

export default function SignInButton() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <button
      onClick={handleSignIn}
      className="bg-white text-[var(--mint-500)] font-medium font-[var(--font-poppins)] px-5 py-2 rounded-full shadow-sm hover:bg-[var(--mint-900)] hover:text-white transition-colors duration-200"
    >
      Sign In
    </button>
  );
}
