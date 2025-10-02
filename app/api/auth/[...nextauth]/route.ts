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
  secret :process.env.NEXTAUTH_SECRET ??" secret",
 callbacks: {
  async jwt({ token, user }) {
    // Attach the user id from database to token on login
    if (user) {
      token.id = user.id; // Prisma user id
    }
    return token;
  },
  async session({ session, token }) {
    // Attach the token id to session user
    if (session.user && token) {
      session.user.id = token.id as string;
    }
    return session;
  },
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
}


});

export { handler as GET, handler as POST };
