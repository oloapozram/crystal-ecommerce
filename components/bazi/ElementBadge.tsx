import { Badge } from '@/components/ui/badge';

interface ElementBadgeProps {
  element: string;
}

const elementColors: Record<string, string> = {
  wood: 'bg-green-100 text-green-800 border-green-300',
  fire: 'bg-red-100 text-red-800 border-red-300',
  earth: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  metal: 'bg-gray-100 text-gray-800 border-gray-300',
  water: 'bg-blue-100 text-blue-800 border-blue-300',
};

export function ElementBadge({ element }: ElementBadgeProps) {
  const colorClass = elementColors[element.toLowerCase()] || 'bg-gray-100';

  return (
    <Badge variant="outline" className={`${colorClass} capitalize`}>
      {element}
    </Badge>
  );
}
