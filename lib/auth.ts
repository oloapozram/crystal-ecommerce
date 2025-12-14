import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                // Require environment variables for admin credentials
                const adminUser = process.env.ADMIN_USERNAME;
                const adminPass = process.env.ADMIN_PASSWORD;

                if (!adminUser || !adminPass) {
                    console.error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables");
                    throw new Error("Admin credentials not configured");
                }

                if (
                    credentials.username === adminUser &&
                    credentials.password === adminPass
                ) {
                    return { id: "1", name: "Admin", email: "admin@crystal.com", role: "admin" }
                }
                return null
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
            }
            return token
        },
        session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
})
