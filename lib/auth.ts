import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(1),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Check against environment variables
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (email === adminEmail && password === adminPassword) {
          return {
            id: "1",
            email: email,
            name: "Admin",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/api/auth/signin",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  session: {
    strategy: "jwt",
  },
});

