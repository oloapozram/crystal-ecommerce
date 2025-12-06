import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ShoppingBag, LayoutDashboard } from "lucide-react"

export function Header() {
    return (
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        <span className="text-xl font-heading font-bold">Crystal Essence</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">
                            Shop
                        </Link>
                        <Link href="/find-your-crystal" className="text-sm font-medium hover:text-primary transition-colors">
                            Find Your Crystal
                        </Link>
                        <Link href="/admin/products" className="text-sm font-medium hover:text-primary transition-colors">
                            <LayoutDashboard className="w-4 h-4 inline mr-1" />
                            Admin
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon">
                            <ShoppingBag className="w-5 h-5" />
                        </Button>
                        <Link href="/find-your-crystal" className="hidden sm:block">
                            <Button size="sm">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Find Your Crystal
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
