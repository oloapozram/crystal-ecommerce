"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, LayoutDashboard, Menu } from "lucide-react"
import { CartBadge } from "@/components/cart/cart-badge"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export function Header() {
    const [isOpen, setIsOpen] = useState(false)

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
                        <CartBadge />
                        <Link href="/find-your-crystal" className="hidden sm:block">
                            <Button size="sm">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Find Your Crystal
                            </Button>
                        </Link>

                        {/* Mobile Menu */}
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild className="md:hidden">
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center space-x-2">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        <span>Crystal Essence</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col space-y-4 mt-8">
                                    <Link
                                        href="/shop"
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                    >
                                        Shop
                                    </Link>
                                    <Link
                                        href="/find-your-crystal"
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                    >
                                        Find Your Crystal
                                    </Link>
                                    <Link
                                        href="/cart"
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                    >
                                        Cart
                                    </Link>
                                    <Link
                                        href="/admin/products"
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                    >
                                        <LayoutDashboard className="w-5 h-5 inline mr-2" />
                                        Admin
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}
