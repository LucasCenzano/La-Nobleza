import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',      type: 'email'    },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await prisma.administrador.findUnique({
          where: { email: credentials.email },
        });

        if (!admin) return null;

        const passwordMatch = await compare(credentials.password, admin.password);
        if (!passwordMatch) return null;

        return { id: admin.id, email: admin.email, name: admin.nombre };
      },
    }),
  ],
  session: { strategy: 'jwt' as const },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) session.user.id = token.id;
      return session;
    },
  },
};

export default NextAuth(authOptions);
