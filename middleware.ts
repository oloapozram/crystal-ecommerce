import { auth } from "@/lib/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnAdmin = req.nextUrl.pathname.startsWith("/admin")

    if (isOnAdmin && !isLoggedIn) {
        return Response.redirect(new URL("/auth/signin", req.nextUrl))
    }
})

export const config = {
    matcher: ["/admin/:path*"],
}
