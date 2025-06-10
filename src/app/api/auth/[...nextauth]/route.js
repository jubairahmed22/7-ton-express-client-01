import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from '../../../../lib/axios'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const response = await axios.post('https://server-7tons.vercel.app/api/auth/login', credentials)
          const data = response.data

          if (data?.token) {
            return {
              id: data._id,
              name: data.name,
              email: data.email,
              role: data.role || 'user', // Default to 'user' if role not provided
              token: data.token,
              // Add any other user fields you need
            }
          }
          throw new Error(data?.message || 'Authentication failed')
        } catch (error) {
          console.error('Login error:', error.response?.data || error.message)
          throw new Error(
            error.response?.data?.message || 
            error.message || 
            'Login failed. Please try again.'
          )
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
        token.accessToken = user.token
      }

      // Handle session update if triggered
      if (trigger === "update" && session?.user) {
        token.user = { ...token.user, ...session.user }
      }

      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.user = token.user
      session.accessToken = token.accessToken
      session.error = token.error // For passing error messages to client
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login' // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "asdfrqwe5r5655874asdfasdfqw74742sad",
  debug: process.env.NODE_ENV === 'development',
  // Enable safer security defaults
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }