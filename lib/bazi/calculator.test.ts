import { describe, it, expect } from 'vitest';
import { getBirthYearElement, calculateBaziChart } from './calculator';

describe('getBirthYearElement', () => {
  it('should return correct element for 1990', () => {
    const result = getBirthYearElement(1990);

    expect(result.element).toBe('metal');
    expect(result.animal).toBe('Horse');
    expect(result.yin_yang).toBe('yang');
    expect(result.stem).toBe('Geng');
  });

  it('should return correct element for 2025', () => {
    const result = getBirthYearElement(2025);

    expect(result.element).toBe('wood');
    expect(result.animal).toBe('Snake');
    expect(result.yin_yang).toBe('yin');
  });

  it('should handle years before 1984', () => {
    // 1960 + 60 = 2020 (Metal Rat in our dataset)
    const result = getBirthYearElement(1960);
    expect(result.element).toBe('metal');
    expect(result.animal).toBe('Rat');
    expect(result.yin_yang).toBe('yang');
    expect(result.year).toBe(1960); // Should preserve original year
  });
});

describe('calculateBaziChart', () => {
  it('should calculate full Bazi chart for Fire element', () => {
    const chart = calculateBaziChart(1986); // Fire Tiger

    expect(chart.dominantElement).toBe('fire');
    expect(chart.birthYear.animal).toBe('Tiger');
    expect(chart.needsBalance).toContain('water');
    expect(chart.strengths).toContain('fire');
    expect(chart.strengths).toContain('wood'); // wood produces fire
  });

  it('should calculate secondary element based on yin/yang', () => {
    const yangChart = calculateBaziChart(1990); // Yang Metal Horse
    const yinChart = calculateBaziChart(1991); // Yin Metal Goat

    expect(yangChart.secondaryElement).toBe('water'); // metal produces water
    expect(yinChart.secondaryElement).toBe('earth'); // earth produces metal
  });
});
