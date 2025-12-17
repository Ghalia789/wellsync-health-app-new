import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      isGoogleUser?: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    isGoogleUser?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      isGoogleUser?: boolean;
    };
  }
}
