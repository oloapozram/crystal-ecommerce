import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-purple-50 to-white">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold text-purple-900">Crystal Essence</h1>
        <p className="text-xl text-gray-600">
          Discover crystals that resonate with your unique energy
        </p>
        <p className="text-lg text-gray-500">
          Using a personalized elemental profile to find your perfect crystal match
        </p>
        <Link href="/find-your-crystal">
          <Button size="lg" className="mt-4">
            <Sparkles className="w-5 h-5 mr-2" />
            Find Your Crystal
          </Button>
        </Link>
      </div>
    </main>
  );
}
