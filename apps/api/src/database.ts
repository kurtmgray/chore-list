import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { config } from './config';
import type { DB } from './types/database';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
});

// Create Kysely instance
export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
});

export default db;