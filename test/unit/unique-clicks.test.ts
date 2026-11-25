import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import type { Config } from '../../src/config.js';
import type { Link, LinksRepository } from '../../src/links/links.repository.js';
import { linksRoutes } from '../../src/links/links.routes.js';

const config: Config = {
  databaseUrl: '',
  adminToken: 'test-admin-token',
  publicBaseUrl: 'http://esgi-lnk.test',
  appVersion: 'test',
  port: 0,
};

const link: Link = {
  code: 'abc123',
  url: 'https://example.com/',
  clicks: 3,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  expiresAt: new Date('2099-01-01T00:00:00Z'),
};

// Faux dépôt en mémoire : aucun accès à la base.
function buildApp() {
  const recorded: Array<{ code: string; ip: string }> = [];
  const repository = {
    findByCode: async (code: string) => (code === link.code ? link : undefined),
    incrementClicks: async () => {},
    recordUniqueClick: async (code: string, ip: string) => {
      recorded.push({ code, ip });
    },
    countUniqueClicks: async () => 2,
  } as unknown as LinksRepository;
  const app = Fastify();
  linksRoutes(app, config, repository);
  return { app, recorded };
}

describe('clics uniques', () => {
  it("la redirection transmet l'IP du visiteur à recordUniqueClick", async () => {
    const { app, recorded } = buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/r/abc123',
      remoteAddress: '203.0.113.7',
    });
    expect(response.statusCode).toBe(302);
    expect(recorded).toEqual([{ code: 'abc123', ip: '203.0.113.7' }]);
  });

  it('stats renvoie uniqueClicks', async () => {
    const { app } = buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/links/abc123/stats',
      headers: { authorization: 'Bearer test-admin-token' },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.uniqueClicks).toBe(2);
    expect(body.clicks).toBe(3);
    expect(Object.keys(body)[0]).toBe('uniqueClicks');
  });
});
