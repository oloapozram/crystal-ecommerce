import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ShoppingBag, Compass } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 bg-gradient-to-b from-purple-50 via-white to-purple-50/30">
        <div className="text-center space-y-6 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-purple-900">
            Crystal Essence
          </h1>
          <p className="text-xl md:text-2xl text-gray-700">
            Discover crystals that resonate with your unique energy
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Using personalized elemental profile analysis to find your perfect crystal match
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/find-your-crystal">
              <Button size="lg" className="w-full sm:w-auto">
                <Sparkles className="w-5 h-5 mr-2" />
                Find Your Crystal
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-heading font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Compass className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Share Your Energy Profile</CardTitle>
              <CardDescription>
                Tell us your birth date and current life intentions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We analyze your unique elemental balance using traditional principles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Get Personalized Matches</CardTitle>
              <CardDescription>
                Receive crystal recommendations tailored to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our AI explains why each crystal resonates with your energy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Shop With Confidence</CardTitle>
              <CardDescription>
                Browse our curated collection of quality crystals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Each crystal is carefully selected and graded for authenticity
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to find your perfect crystal?
          </h2>
          <p className="text-lg mb-8 text-purple-100">
            Start your personalized crystal journey today
          </p>
          <Link href="/find-your-crystal">
            <Button size="lg" variant="secondary">
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
