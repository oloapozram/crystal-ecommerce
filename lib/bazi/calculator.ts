import birthYearElements from '@/lib/bazi-knowledge/birth-year-elements.json';

export interface BirthYearInfo {
  year: number;
  stem: string;
  branch: string;
  element: string;
  animal: string;
  yin_yang: string;
}

export function getBirthYearElement(year: number): BirthYearInfo {
  // First try direct lookup
  const yearStr = year.toString();
  if (birthYearElements[yearStr as keyof typeof birthYearElements]) {
    return {
      year,
      ...birthYearElements[yearStr as keyof typeof birthYearElements],
    };
  }

  // For years outside our data range, calculate using 60-year cycle
  // The Chinese zodiac repeats every 60 years (Sexagenary cycle)
  const cycle = 60;
  const minYear = 1984;
  const maxYear = 2025;

  // Calculate which year in our range has the same position in the cycle
  let referenceYear = year;

  if (year < minYear) {
    // For years before 1984, add 60 to find equivalent year
    referenceYear = year + cycle;
    // If still outside range, year cannot be mapped
    if (referenceYear > maxYear) {
      throw new Error(`Year ${year} cannot be mapped to available data range (${minYear}-${maxYear}). Years 1966-1983 require data beyond 2025.`);
    }
  } else if (year > maxYear) {
    // For years after 2025, subtract 60 to find equivalent year
    referenceYear = year - cycle;
    // If still outside range, year cannot be mapped
    if (referenceYear < minYear) {
      throw new Error(`Year ${year} cannot be mapped to available data range (${minYear}-${maxYear}). Years 2026-2043 require data before 1984.`);
    }
  }

  const refYearStr = referenceYear.toString();
  if (birthYearElements[refYearStr as keyof typeof birthYearElements]) {
    return {
      year,
      ...birthYearElements[refYearStr as keyof typeof birthYearElements],
    };
  }

  // Fallback
  throw new Error(`Unable to calculate Bazi for year ${year}`);
}

export interface BaziChart {
  birthYear: BirthYearInfo;
  dominantElement: string;
  secondaryElement: string | null;
  needsBalance: string[];
  strengths: string[];
}

export function calculateBaziChart(birthYear: number): BaziChart {
  const yearInfo = getBirthYearElement(birthYear);

  // In simplified Bazi, year element is dominant
  const dominantElement = yearInfo.element;

  // Secondary element comes from yin/yang nature
  // Yang elements tend toward producing, Yin toward receiving
  const secondaryElement = yearInfo.yin_yang === 'yang'
    ? getProducedElement(dominantElement)
    : getProducingElement(dominantElement);

  // Determine which elements need balancing
  const needsBalance = getControllingElements(dominantElement);

  // Strengths are elements that support dominant
  const strengths = [
    dominantElement,
    getProducingElement(dominantElement),
  ];

  return {
    birthYear: yearInfo,
    dominantElement,
    secondaryElement,
    needsBalance,
    strengths,
  };
}

// Helper functions based on Five Elements cycle
function getProducedElement(element: string): string {
  const cycle: Record<string, string> = {
    wood: 'fire',
    fire: 'earth',
    earth: 'metal',
    metal: 'water',
    water: 'wood',
  };
  return cycle[element] || element;
}

function getProducingElement(element: string): string {
  const cycle: Record<string, string> = {
    fire: 'wood',
    earth: 'fire',
    metal: 'earth',
    water: 'metal',
    wood: 'water',
  };
  return cycle[element] || element;
}

function getControllingElements(element: string): string[] {
  const controlling: Record<string, string[]> = {
    wood: ['metal', 'earth'], // metal cuts wood, wood depletes earth
    fire: ['water', 'metal'], // water extinguishes fire, fire weakens metal
    earth: ['wood', 'water'], // wood penetrates earth, earth blocks water
    metal: ['fire', 'wood'], // fire melts metal, metal cuts wood
    water: ['earth', 'fire'], // earth absorbs water, water extinguishes fire
  };
  return controlling[element] || [];
}
