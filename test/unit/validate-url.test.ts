import { describe, expect, it } from 'vitest';
import { isAllowedUrl } from '../../src/links/validate-url.js';

const OWN_HOST = 'esgi-lnk.test';

describe('isAllowedUrl', () => {
  it('accepte une URL https', () => {
    expect(isAllowedUrl('https://example.com/page', OWN_HOST)).toBe(true);
  });

  it('accepte une URL http', () => {
    expect(isAllowedUrl('http://example.com', OWN_HOST)).toBe(true);
  });

  it('accepte une URL avec paramètres et fragment', () => {
    expect(isAllowedUrl('https://example.com/a?b=1#c', OWN_HOST)).toBe(true);
  });

  it('refuse javascript:', () => {
    expect(isAllowedUrl('javascript:alert(1)', OWN_HOST)).toBe(false);
  });

  it('refuse une chaîne qui n’est pas une URL', () => {
    expect(isAllowedUrl('pas une url', OWN_HOST)).toBe(false);
  });

  it('refuse une chaîne vide', () => {
    expect(isAllowedUrl('', OWN_HOST)).toBe(false);
  });

  it('refuse une URL de plus de 2000 caractères', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2000);
    expect(isAllowedUrl(longUrl, OWN_HOST)).toBe(false);
  });

  it('accepte une URL de 2000 caractères', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(1980);
    expect(isAllowedUrl(longUrl, OWN_HOST)).toBe(true);
  });
});
