import { CrystalFinderForm } from '@/components/find-crystal/crystal-finder-form'

export const metadata = {
    title: 'Find Your Crystal | Crystal E-Commerce',
    description: 'Discover the perfect crystals for your unique energy profile based on your Bazi chart and life intentions.',
}

export default function FindYourCrystalPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="container mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Find Your Perfect Crystal
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Discover crystals that resonate with your unique energy profile.
                        We combine ancient Bazi wisdom with your personal intentions to recommend
                        the crystals that will support your journey.
                    </p>
                </div>

                {/* Form */}
                <CrystalFinderForm />

                {/* Info Section */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="text-4xl mb-3">🔮</div>
                            <h3 className="font-semibold mb-2">Personalized Analysis</h3>
                            <p className="text-sm text-muted-foreground">
                                Your birth chart reveals your unique elemental balance
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl mb-3">✨</div>
                            <h3 className="font-semibold mb-2">AI-Powered Matching</h3>
                            <p className="text-sm text-muted-foreground">
                                Advanced algorithms find crystals that complement your energy
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl mb-3">💎</div>
                            <h3 className="font-semibold mb-2">Authentic Crystals</h3>
                            <p className="text-sm text-muted-foreground">
                                Every recommendation links to genuine, quality-verified crystals
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
