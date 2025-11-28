import { BaziChart } from './calculator';
import compatibilityRules from '@/lib/bazi-knowledge/compatibility-rules.json';
import zodiacCompat from '@/lib/bazi-knowledge/zodiac-compatibility.json';

export interface CompatibilityScore {
  totalScore: number;
  elementScore: number;
  zodiacScore: number;
  explanation: string;
  warnings: string[];
  recommendations: string[];
}

export function calculateCrystalCompatibility(
  chart: BaziChart,
  crystalElement: string,
  crystalAnimal?: string
): CompatibilityScore {
  let elementScore = 0;
  let zodiacScore = 0;
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let explanation = '';

  // Base score
  const baseScore = 50;

  // Calculate element compatibility
  const userElement = chart.dominantElement;

  // Same element - strong support
  if (crystalElement === userElement) {
    elementScore = compatibilityRules.same_element.score_boost;
    explanation = compatibilityRules.same_element.explanation;
    recommendations.push(`This ${crystalElement} crystal directly strengthens your ${userElement} energy`);
  } else {
    // Check productive cycle (crystal produces user element)
    const productiveCycle = compatibilityRules.productive_cycle.relationships;
    let foundProductive = false;

    for (const [key, value] of Object.entries(productiveCycle)) {
      if (value.from === crystalElement && value.to === userElement) {
        elementScore = value.score_boost;
        explanation = value.explanation;
        recommendations.push(explanation);
        foundProductive = true;
        break;
      }
    }

    if (!foundProductive) {
      // Check controlling cycle
      const controllingCycle = compatibilityRules.controlling_cycle.relationships;

      for (const [key, value] of Object.entries(controllingCycle)) {
        if (value.from === crystalElement && value.to === userElement) {
          elementScore = value.score_penalty;
          explanation = value.warning;
          warnings.push(value.warning);
          break;
        }
        if (value.from === userElement && value.to === crystalElement) {
          // User controls crystal - can be beneficial for grounding excess
          elementScore = 10;
          explanation = `Your ${userElement} energy can harness this ${crystalElement} crystal's power`;
          recommendations.push('Use this crystal to channel and direct your energy');
          break;
        }
      }
    }
  }

  // Calculate zodiac compatibility if crystal animal provided
  if (crystalAnimal && chart.birthYear.animal) {
    const userAnimalData = zodiacCompat.animals[chart.birthYear.animal as keyof typeof zodiacCompat.animals];
    const scoring = zodiacCompat.compatibility_scoring;

    if (userAnimalData) {
      if (userAnimalData.best_matches.includes(crystalAnimal)) {
        zodiacScore = scoring.best_match.score_boost;
        recommendations.push(`${crystalAnimal} and ${chart.birthYear.animal} have natural harmony`);
      } else if (userAnimalData.good_matches.includes(crystalAnimal)) {
        zodiacScore = scoring.good_match.score_boost;
      } else if (userAnimalData.challenging_matches.includes(crystalAnimal)) {
        zodiacScore = scoring.challenging_match.score_penalty;
        warnings.push('This zodiac pairing may require extra mindfulness');
      } else if (userAnimalData.conflict === crystalAnimal) {
        zodiacScore = scoring.conflict.score_penalty;
        warnings.push(`${crystalAnimal} and ${chart.birthYear.animal} are opposing signs`);
      }
    }
  }

  const totalScore = baseScore + elementScore + zodiacScore;

  return {
    totalScore,
    elementScore,
    zodiacScore,
    explanation,
    warnings,
    recommendations,
  };
}

export interface CrystalMatch {
  productId: number;
  productName: string;
  crystalType: string;
  element: string;
  compatibilityScore: CompatibilityScore;
  price: number;
  inStock: boolean;
}

export async function matchCrystalsToChart(
  chart: BaziChart,
  availableProducts: any[]
): Promise<CrystalMatch[]> {
  const matches: CrystalMatch[] = [];

  for (const product of availableProducts) {
    if (!product.baziElement) continue;

    const compatibility = calculateCrystalCompatibility(
      chart,
      product.baziElement.toLowerCase(),
      undefined // We don't track zodiac animal per crystal currently
    );

    matches.push({
      productId: product.id,
      productName: `${product.baseName} ${product.sizeMm}mm ${product.qualityGrade}`,
      crystalType: product.baseName,
      element: product.baziElement,
      compatibilityScore: compatibility,
      price: product.pricing?.totalRetailPrice || 0,
      inStock: product.stockAvailable > 0,
    });
  }

  // Sort by compatibility score descending
  matches.sort((a, b) => b.compatibilityScore.totalScore - a.compatibilityScore.totalScore);

  return matches;
}
