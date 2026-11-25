import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import type { LinksRepository } from '../../src/links/links.repository.js';
import { linksRoutes } from '../../src/links/links.routes.js';

const config = { databaseUrl: '', adminToken: 'test-admin-token', publicBaseUrl: 'http://esgi-lnk.test', appVersion: 'test', port: 0 };

// Faux dépôt en mémoire : aucun accès à la base.
const repository = {
  findByCode: async () => ({
    code: 'abc123',
    url: 'https://example.com',
    clicks: 3,
    createdAt: new Date('2026-01-14T10:00:00Z'),
    expiresAt: new Date('2026-02-14T10:00:00Z'),
  }),
  clicksByDay: async () => [{ day: '2026-01-15', clicks: 3 }],
  countUniqueClicks: async () => 0,
} as unknown as LinksRepository;

describe('GET /links/:code/stats — clicksByDay', () => {
  it('renvoie les clics regroupés par jour', async () => {
    const app = Fastify();
    linksRoutes(app, config, repository);

    const response = await app.inject({
      method: 'GET',
      url: '/links/abc123/stats',
      headers: { authorization: 'Bearer test-admin-token' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().clicksByDay).toEqual([{ day: '2026-01-15', clicks: 3 }]);
  });
});
