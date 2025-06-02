import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import clientPromise from "./db";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";

let client: MongoClient;

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        try {
          // Ensure we have a valid client connection
          if (!client) {
            client = await clientPromise;
          }
          const db = client.db();

          // Normalize email to lowercase
          const email = credentials.email.toLowerCase();

          console.log(`Attempting to find user with email: ${email}`);

          // Find user with minimal projection
          const user = await db.collection("users").findOne(
            { email },
            {
              projection: {
                _id: 1,
                name: 1,
                email: 1,
                password: 1,
                role: 1,
                isActive: 1,
                image: 1
              }
            }
          );

          console.log('User found:', user ? 'Yes' : 'No');

          if (!user) {
            // Check if email exists in any OAuth accounts
            const oauthUser = await db.collection("accounts").findOne({
              email: email
            });

            if (oauthUser) {
              throw new Error("Please sign in with your social account");
            }

            throw new Error("No account found with this email. Please register first.");
          }

          if (!user.password) {
            console.log('User found but no password set');
            throw new Error("Please sign in with your social account");
          }

          if (user.isActive === false) {
            console.log('User account is inactive');
            throw new Error("Your account is not active. Please contact support.");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('Password valid:', isPasswordValid ? 'Yes' : 'No');

          if (!isPasswordValid) {
            throw new Error("Invalid password. Please try again.");
          }

          // Update last login timestamp
          await db.collection("users").updateOne(
            { _id: user._id },
            { 
              $set: { 
                lastLogin: new Date(),
                updatedAt: new Date()
              } 
            }
          );

          // Return user data
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image || null,
            role: user.role || 'USER', // Default to USER if role is not set
          };
        } catch (error) {
          console.error("Authentication error:", error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("An unexpected error occurred. Please try again.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user) {
        // Update last login time
        const db = (await clientPromise).db();
        await db.collection("users").updateOne(
          { email: user.email },
          {
            $set: {
              lastLogin: new Date(),
              updatedAt: new Date()
            }
          }
        );
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}; 