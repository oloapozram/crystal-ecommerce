import { Badge } from '@/components/ui/badge'

interface BaziSummaryProps {
    chart: {
        yearElement: string
        dayElement: string
        dominantElement: string
    }
    summary: string
}

const ELEMENT_COLORS = {
    WOOD: 'bg-green-100 text-green-800 border-green-300',
    FIRE: 'bg-red-100 text-red-800 border-red-300',
    EARTH: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    METAL: 'bg-gray-100 text-gray-800 border-gray-300',
    WATER: 'bg-blue-100 text-blue-800 border-blue-300',
}

const ELEMENT_SYMBOLS = {
    WOOD: '🌳',
    FIRE: '🔥',
    EARTH: '⛰️',
    METAL: '⚙️',
    WATER: '💧',
}

export function BaziSummary({ chart, summary }: BaziSummaryProps) {
    const elementName = chart.dominantElement.charAt(0) + chart.dominantElement.slice(1).toLowerCase()
    const colorClass = ELEMENT_COLORS[chart.dominantElement as keyof typeof ELEMENT_COLORS]
    const symbol = ELEMENT_SYMBOLS[chart.dominantElement as keyof typeof ELEMENT_SYMBOLS]

    return (
        <div className="max-w-2xl mx-auto p-6 bg-secondary/10 rounded-xl border border-secondary/20">
            <div className="text-center mb-4">
                <div className="text-6xl mb-2">{symbol}</div>
                <h3 className="text-xl font-semibold mb-2">Your Energy Profile</h3>
                <Badge className={`${colorClass} text-lg px-4 py-1`}>
                    {elementName} Dominant
                </Badge>
            </div>

            <p className="text-center text-muted-foreground leading-relaxed">
                {summary}
            </p>

            <div className="mt-4 flex justify-center gap-4 text-sm">
                <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Year</div>
                    <Badge variant="outline" className="capitalize">
                        {chart.yearElement.toLowerCase()}
                    </Badge>
                </div>
                <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Day</div>
                    <Badge variant="outline" className="capitalize">
                        {chart.dayElement.toLowerCase()}
                    </Badge>
                </div>
            </div>
        </div>
    )
}
