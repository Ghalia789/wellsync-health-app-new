/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import User from "@/models/User";
import connectMongo from "../../../../utils/db";

export const authOptions: NextAuthOptions = {
  providers: [
    // 🟢 Connexion classique (email + mot de passe)
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
        const isValid = await bcrypt.compare(credentials!.password, user.password);
        if (!isValid) throw new Error("Mot de passe incorrect !");
        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
      },
    }),

    // 🟣 Connexion via Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 jours

  callbacks: {
    // ✅ Création auto de l’utilisateur Google dans MongoDB
    async signIn({ user, account }) {
      await connectMongo();
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser && account?.provider === "google") {
        await User.create({
          name: user.name,
          email: user.email,
          password: "google-auth",
          role: "user",
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },

    async session({ session, token }) {
      (session as any).user = token.user;
      return session;
    },
  },

  pages: { signIn: "/login" },
};

export default NextAuth(authOptions);
