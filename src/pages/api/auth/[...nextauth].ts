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
          name: user.name,
          email: user.email,
          role: user.role,
        };
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
    // SIGN IN → assure que l'utilisateur Google existe dans MongoDB
    async signIn({ user, account }) {
      await connectMongo();

      let existingUser = await User.findOne({ email: user.email });

      // Si user Google n'existe pas → le créer
      if (!existingUser && account?.provider === "google") {
        existingUser = await User.create({
          name: user.name,
          email: user.email,
          password: "google-auth", // useless mais obligatoire
          role: "user",
        });
      }


      // Important : on injecte l’ObjectId de MongoDB dans "user.id"
      if (existingUser) user.id = existingUser._id.toString();

      return true;
    },

    // JWT → stocke l'ObjectId Mongo dans le token
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id, // ObjectId
          name: user.name,
          email: user.email,
          role: (user as any).role ?? "user",
        };
      }
      return token;
    },

    // SESSION → renvoie token.user au front-end
    async session({ session, token }) {
      session.user = token.user as any;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
