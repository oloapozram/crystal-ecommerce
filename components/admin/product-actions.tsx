'use client'

import { Button } from "@/components/ui/button"
import { deleteProduct } from "@/app/admin/products/actions"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function DeleteProductButton({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    return (
        <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={() => {
                if (confirm("Are you sure you want to delete this product?")) {
                    startTransition(async () => {
                        await deleteProduct(id)
                        router.refresh()
                    })
                }
            }}
        >
            {isPending ? "..." : "Delete"}
        </Button>
    )
}
