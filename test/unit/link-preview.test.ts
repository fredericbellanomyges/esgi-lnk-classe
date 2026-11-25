import Fastify from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';
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
  url: 'https://example.com/cible',
  clicks: 4,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  expiresAt: new Date('2999-01-01T00:00:00.000Z'),
};

describe('GET /links/:code', () => {
  let incrementCalls: number;
  let app: ReturnType<typeof Fastify>;

  beforeEach(() => {
    incrementCalls = 0;
    // Faux dépôt en mémoire : aucun accès à la base.
    const repository = {
      findByCode: async (code: string) => (code === link.code ? link : undefined),
      incrementClicks: async () => {
        incrementCalls++;
      },
    } as unknown as LinksRepository;
    app = Fastify();
    linksRoutes(app, config, repository);
  });

  it("renvoie l'URL et l'expiration sans rediriger", async () => {
    const response = await app.inject({ method: 'GET', url: '/links/abc123' });
    expect(response.statusCode).toBe(200);
    expect(response.headers.location).toBeUndefined();
    expect(response.json()).toEqual({
      url: 'https://example.com/cible',
      expiresAt: '2999-01-01T00:00:00.000Z',
    });
  });

  it('ne compte pas de clic', async () => {
    await app.inject({ method: 'GET', url: '/links/abc123' });
    expect(incrementCalls).toBe(0);
  });

  it('répond 404 pour un code inconnu', async () => {
    const response = await app.inject({ method: 'GET', url: '/links/inconnu' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Lien inconnu' });
  });
});
