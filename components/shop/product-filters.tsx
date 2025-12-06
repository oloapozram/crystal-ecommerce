'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

export function ProductFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentElement = searchParams.get('element')
    const currentQuality = searchParams.get('quality')

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/shop?${params.toString()}`)
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold mb-3">Bazi Element</h3>
                <RadioGroup
                    value={currentElement || "all"}
                    onValueChange={(v) => updateFilter('element', v === "all" ? null : v)}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="element-all" />
                        <Label htmlFor="element-all">All</Label>
                    </div>
                    {['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'].map(e => (
                        <div key={e} className="flex items-center space-x-2">
                            <RadioGroupItem value={e} id={`element-${e}`} />
                            <Label htmlFor={`element-${e}`} className="capitalize">{e.toLowerCase()}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Quality</h3>
                <RadioGroup
                    value={currentQuality || "all"}
                    onValueChange={(v) => updateFilter('quality', v === "all" ? null : v)}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="quality-all" />
                        <Label htmlFor="quality-all">All</Label>
                    </div>
                    {['NORMAL', 'GOOD', 'HIGH'].map(q => (
                        <div key={q} className="flex items-center space-x-2">
                            <RadioGroupItem value={q} id={`quality-${q}`} />
                            <Label htmlFor={`quality-${q}`} className="capitalize">{q.toLowerCase()}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {(currentElement || currentQuality) && (
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/shop')}
                >
                    Clear Filters
                </Button>
            )}
        </div>
    )
}
