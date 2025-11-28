import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ElementBadge } from './ElementBadge';

interface BaziChartData {
  birthYear: number;
  animal: string;
  element: string;
  dominantElement: string;
  secondaryElement: string | null;
  needsBalance: string[];
  strengths: string[];
}

interface BaziChartProps {
  data: BaziChartData;
}

export function BaziChart({ data }: BaziChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Your Bazi Chart</CardTitle>
        <CardDescription>
          Born in {data.birthYear} - Year of the {data.animal}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Zodiac Animal</p>
            <p className="text-lg font-semibold">{data.animal}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Year Element</p>
            <ElementBadge element={data.element} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dominant Element</p>
            <ElementBadge element={data.dominantElement} />
          </div>
          {data.secondaryElement && (
            <div>
              <p className="text-sm font-medium text-gray-500">Secondary Element</p>
              <ElementBadge element={data.secondaryElement} />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Strengths</p>
          <div className="flex gap-2 flex-wrap">
            {data.strengths.map((element) => (
              <ElementBadge key={element} element={element} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Needs Balance</p>
          <div className="flex gap-2 flex-wrap">
            {data.needsBalance.map((element) => (
              <ElementBadge key={element} element={element} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
