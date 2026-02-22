import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const db = await connectToDatabase();
        const user = await db.collection('users').findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!user) {
          throw new Error('No account found with this email');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image || null,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google' || account.provider === 'github') {
        try {
          const db = await connectToDatabase();
          const existingUser = await db.collection('users').findOne({
            email: user.email,
          });

          if (!existingUser) {
            await db.collection('users').insertOne({
              name: user.name,
              email: user.email,
              image: user.image,
              role: 'recruiter',
              provider: account.provider,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            // Update image/name if changed on provider side
            await db.collection('users').updateOne(
              { email: user.email },
              {
                $set: {
                  image: user.image,
                  name: user.name,
                  updatedAt: new Date(),
                },
              }
            );
          }
        } catch (error) {
          console.error('SignIn callback error:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      // On initial sign-in, attach role from the user object
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // On session update or if role is missing, refresh from DB
      if (trigger === 'update' || !token.role) {
        const db = await connectToDatabase();
        const dbUser = await db.collection('users').findOne({
          email: token.email,
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id.toString();
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export default handler;
