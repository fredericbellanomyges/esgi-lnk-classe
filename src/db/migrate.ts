import type { Pool } from 'pg';

export async function migrate(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS unique_clicks (
      code  TEXT NOT NULL,
      ip    TEXT NOT NULL,
      day   DATE NOT NULL DEFAULT current_date,
      PRIMARY KEY (code, ip, day)
    );

    CREATE TABLE IF NOT EXISTS click_events (
      code       TEXT NOT NULL,
      clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS links (
      code        TEXT PRIMARY KEY,
      url         TEXT NOT NULL,
      clicks      INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at  TIMESTAMPTZ NOT NULL
    )
  `);
}
