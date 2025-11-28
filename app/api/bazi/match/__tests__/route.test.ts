import { describe, it, expect } from 'vitest';
import { POST } from '../route';

describe('POST /api/bazi/match', () => {
  it('should return crystal matches for birth year', async () => {
    const requestBody = {
      birthYear: 1990,
    };

    const request = new Request('http://localhost:3000/api/bazi/match', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('baziChart');
    expect(data).toHaveProperty('recommendations');
    expect(data.baziChart.dominantElement).toBe('metal');
    expect(Array.isArray(data.recommendations)).toBe(true);
  });

  it('should rank crystals by compatibility', async () => {
    const requestBody = {
      birthYear: 1986, // Fire element
    };

    const request = new Request('http://localhost:3000/api/bazi/match', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.recommendations.length).toBeGreaterThan(0);

    // First recommendation should have highest score
    if (data.recommendations.length > 1) {
      expect(data.recommendations[0].compatibilityScore.totalScore)
        .toBeGreaterThanOrEqual(data.recommendations[1].compatibilityScore.totalScore);
    }
  });

  it('should return 400 for missing birth year', async () => {
    const request = new Request('http://localhost:3000/api/bazi/match', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
