import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { getUserByEmail } from '@/lib/db'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await getUserByEmail(credentials.email)
        if (!user || !user.password_hash) return null
        const ok = await compare(credentials.password, user.password_hash)
        if (!ok) return null
        // Return a minimal user object (NextAuth stores in token/session)
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    })
  ],
 
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token as any).id
        session.user.role = (token as any).role
      }
      return session
    }
  },
  pages: {
    signIn: '/api/auth/signin'
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
