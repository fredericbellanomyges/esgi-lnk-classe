import type { Pool } from 'pg';
import { generateShortCode } from './short-code.js';

export interface Link {
  code: string;
  url: string;
  clicks: number;
  createdAt: Date;
  expiresAt: Date;
}

interface LinkRow {
  code: string;
  url: string;
  clicks: number;
  created_at: Date;
  expires_at: Date;
}

const MAX_ATTEMPTS = 5;

function toLink(row: LinkRow): Link {
  return {
    code: row.code,
    url: row.url,
    clicks: row.clicks,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export function createLinksRepository(pool: Pool) {
  return {
    // Génère un code et réessaie si un autre lien le porte déjà.
    async create(
      url: string,
      expiresAt: Date,
      generate: () => string = generateShortCode,
    ): Promise<string> {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const code = generate();
        const result = await pool.query(
          `INSERT INTO links (code, url, expires_at) VALUES ($1, $2, $3)
           ON CONFLICT (code) DO NOTHING`,
          [code, url, expiresAt],
        );
        if (result.rowCount === 1) {
          return code;
        }
      }
      throw new Error('Impossible de générer un code unique');
    },

    async findByCode(code: string): Promise<Link | undefined> {
      const result = await pool.query<LinkRow>('SELECT * FROM links WHERE code = $1', [code]);
      const row = result.rows[0];
      return row ? toLink(row) : undefined;
    },

<<<<<<< HEAD
    async logRedirect(code: string, userAgent: string | null): Promise<void> {
      await pool.query(
        'INSERT INTO redirect_log (code, user_agent) VALUES ($1, $2)',
        [code, userAgent],
      );
    },

=======
    // Un seul clic unique par visiteur (IP) et par jour.
    async recordUniqueClick(code: string, ip: string): Promise<void> {
      await pool.query(
        `INSERT INTO unique_clicks (code, ip) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [code, ip],
      );
    },

    async countUniqueClicks(code: string): Promise<number> {
      const result = await pool.query<{ count: number }>(
        'SELECT count(*)::int AS count FROM unique_clicks WHERE code = $1',
        [code],
      );
      return result.rows[0]?.count ?? 0;
    },

>>>>>>> 9a26e40285d8f15780e70153dc680bacaecba8cb
    async incrementClicks(code: string): Promise<void> {
      await pool.query('UPDATE links SET clicks = clicks + 1 WHERE code = $1', [code]);
    },
  };
}

export type LinksRepository = ReturnType<typeof createLinksRepository>;
