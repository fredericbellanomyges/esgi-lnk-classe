import { describe, expect, it } from 'vitest';
import Fastify from 'fastify';
import type { LinksRepository } from '../../src/links/links.repository.js';
import { linksRoutes } from '../../src/links/links.routes.js';
import type { Config } from '../../src/config.js';

const config: Config = {
    databaseUrl: '',
    adminToken: 'test-admin-token',
    publicBaseUrl: 'http://esgi-lnk.test',
    appVersion: 'test',
    port: 0,
};

describe('GET /r/:code', () => {
    it('retourne 404 si le code est inconnu', async () => {
        const repository = { findByCode: async () => undefined } as unknown as LinksRepository;
        const app = Fastify();
        await app.register(async (instance) => {
            linksRoutes(instance, config, repository);
        });

        const response = await app.inject({ method: 'GET', url: '/r/abc123' });

        expect(response.statusCode).toBe(404);
    });
});