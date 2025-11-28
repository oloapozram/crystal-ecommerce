import { describe, it, expect } from 'vitest';
import { calculateCrystalCompatibility, matchCrystalsToChart } from './matching';
import { calculateBaziChart } from './calculator';

describe('calculateCrystalCompatibility', () => {
  it('should give high score for same element crystal', () => {
    const chart = calculateBaziChart(1986); // Fire Tiger
    const crystalElement = 'fire'; // e.g., Rhodonite

    const score = calculateCrystalCompatibility(chart, crystalElement, 'Tiger');

    expect(score.totalScore).toBeGreaterThan(75); // Same element bonus
    expect(score.elementScore).toBe(50); // Same element = +50
  });

  it('should give bonus for productive cycle', () => {
    const chart = calculateBaziChart(1986); // Fire element
    const crystalElement = 'wood'; // Wood feeds Fire

    const score = calculateCrystalCompatibility(chart, crystalElement, 'Dragon');

    expect(score.elementScore).toBe(25); // Productive cycle bonus
    expect(score.explanation).toContain('Wood nourishes Fire');
  });

  it('should give penalty for controlling cycle', () => {
    const chart = calculateBaziChart(1986); // Fire element
    const crystalElement = 'water'; // Water extinguishes Fire

    const score = calculateCrystalCompatibility(chart, crystalElement, 'Rat');

    expect(score.elementScore).toBe(-50); // Controlling cycle penalty
    expect(score.warnings).toContain('Water extinguishes Fire - may dampen passion and vitality');
  });

  it('should add zodiac compatibility bonus', () => {
    const chart = calculateBaziChart(1986); // Tiger
    const crystalElement = 'fire';
    const crystalAnimal = 'Dog'; // Best match with Tiger

    const score = calculateCrystalCompatibility(chart, crystalElement, crystalAnimal);

    expect(score.zodiacScore).toBe(30); // Best match bonus
    expect(score.totalScore).toBeGreaterThan(50);
  });
});
