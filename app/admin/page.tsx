import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminDashboard() {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span>Welcome, {session.user?.name}</span>
                    <form action={async () => {
                        'use server';
                        // Sign out logic here if using server actions, but for now just a link or client component
                    }}>
                        <Link href="/api/auth/signout">
                            <Button variant="outline">Sign Out</Button>
                        </Link>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h3 className="font-semibold text-lg mb-2">Products</h3>
                    <p className="text-muted-foreground mb-4">Manage crystal inventory and details.</p>
                    <Link href="/admin/products">
                        <Button className="w-full">Manage Products</Button>
                    </Link>
                </div>

                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h3 className="font-semibold text-lg mb-2">Suppliers</h3>
                    <p className="text-muted-foreground mb-4">Track suppliers and purchases.</p>
                    <Link href="/admin/suppliers">
                        <Button className="w-full" variant="secondary">Manage Suppliers</Button>
                    </Link>
                </div>

                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h3 className="font-semibold text-lg mb-2">AI Content</h3>
                    <p className="text-muted-foreground mb-4">Review generated descriptions and prompts.</p>
                    <Link href="/admin/ai-content">
                        <Button className="w-full" variant="outline">Review Content</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
