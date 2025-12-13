import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Get all active products
    const products = await prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true },
    })

    // Static routes
    const routes = [
        '',
        '/shop',
        '/cart',
        '/about', // If exists
        '/contact', // If exists
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    // Dynamic product routes
    const productRoutes = products.map((product) => ({
        url: `${BASE_URL}/shop/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...routes, ...productRoutes]
}
