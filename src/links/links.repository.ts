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


    async recordClick(code: string): Promise<void> {
      await pool.query(
        'INSERT INTO click_events (code) VALUES ($1)',
        [code],
      );
    },

    async clicksByDay(code: string): Promise<{ day: string; clicks: number }[]> {
      // Regroupe par jour UTC, du plus ancien au plus récent, day au format YYYY-MM-DD
      const result = await pool.query<{ day: string; clicks: number }>(
        `SELECT to_char(clicked_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
                count(*)::int AS clicks
         FROM click_events
         WHERE code = $1
         GROUP BY day
         ORDER BY day ASC`,
        [code],
      );
      return result.rows;
    },

    async incrementClicks(code: string): Promise<void> {
      await pool.query('UPDATE links SET clicks = clicks + 1 WHERE code = $1', [code]);
    },
  };
}

export type LinksRepository = ReturnType<typeof createLinksRepository>;
