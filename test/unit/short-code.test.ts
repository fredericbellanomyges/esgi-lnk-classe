import { describe, expect, it } from 'vitest';
import { generateShortCode } from '../../src/links/short-code.js';

// Générateur déterministe : renvoie les valeurs données, en boucle.
function sequence(...values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length] as number;
}

describe('generateShortCode', () => {
  it('produit 7 caractères', () => {
    expect(generateShortCode()).toHaveLength(7);
  });

  it('produit uniquement des caractères alphanumériques', () => {
    expect(generateShortCode()).toMatch(/^[A-Za-z0-9]{7}$/);
  });

  it('utilise le générateur injecté', () => {
    expect(generateShortCode(() => 0)).toBe('AAAAAAA');
  });

  it('peut produire des majuscules, des minuscules et des chiffres', () => {
    const code = generateShortCode(sequence(0, 26 / 62, 52 / 62));
    expect(code).toBe('Aa0Aa0A');
  });

  it('reste dans l’alphabet pour la valeur limite du générateur', () => {
    expect(generateShortCode(() => 0.999999)).toBe('9999999');
  });
});
