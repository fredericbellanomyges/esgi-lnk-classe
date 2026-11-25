import type { Pool } from 'pg';

export async function migrate(pool: Pool): Promise<void> {
  await pool.query(`
<<<<<<< HEAD
    CREATE TABLE IF NOT EXISTS redirect_log (
        code TEXT NOT NULL, 
        at TIMESTAMPTZ NOT NULL DEFAULT now(), 
        user_agent TEXT
    );
    
=======
    CREATE TABLE IF NOT EXISTS unique_clicks (
      code  TEXT NOT NULL,
      ip    TEXT NOT NULL,
      day   DATE NOT NULL DEFAULT current_date,
      PRIMARY KEY (code, ip, day)
    )
  `);
  await pool.query(`
>>>>>>> 9a26e40285d8f15780e70153dc680bacaecba8cb
    CREATE TABLE IF NOT EXISTS links (
      code        TEXT PRIMARY KEY,
      url         TEXT NOT NULL,
      clicks      INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at  TIMESTAMPTZ NOT NULL
    )
  `);
}
