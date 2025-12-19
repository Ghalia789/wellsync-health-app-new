/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import User from "@/models/User";
import connectMongo from "../../../../utils/db";

export const authOptions: NextAuthOptions = {
  providers: [
    // Login par email + mot de passe
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectMongo();

        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error("Utilisateur introuvable !");

        const isValid = await bcrypt.compare(
          credentials!.password,
          user.password
        );
        if (!isValid) throw new Error("Mot de passe incorrect !");

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        } as any;
      },

    }),

    // Login via Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  },

  callbacks: {
    async signIn({ user, account }) {
      await connectMongo();

      let existingUser = await User.findOne({ email: user.email });

      if (!existingUser && account?.provider === "google") {
        existingUser = await User.create({
          name: user.name,
          email: user.email,
          password: "google-auth",
        });
      }

      if (existingUser) {
        user.id = existingUser._id.toString();
        (user as any).isAdmin = user.email === "admin@wellsync.com";
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.user = {
          id: (user as any).id,
          name: user.name,
          email: user.email,
          isAdmin: (user as any).isAdmin ?? false,
        } as any;

        token.isGoogleUser = account?.provider === "google";
      }

      return token;
    },

    async session({ session, token }) {
      session.user = token.user as any;
      // session.user.isAdmin = (token.user as any)?.isAdmin ?? false;
      session.user.isGoogleUser = token.isGoogleUser as boolean;
      return session;
    },
  },



  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
