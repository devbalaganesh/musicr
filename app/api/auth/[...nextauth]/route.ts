import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prismaClient } from '@/app/lib/db';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
    

      if (!user.email) return false;

      try {
        const existingUser = await prismaClient.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prismaClient.user.create({
            data: {
              email: user.email,
              provider: "Google",
            },
          });
        }

        return true;
      } catch (error) {
        console.error("SignIn DB error:", error);
        return false;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
