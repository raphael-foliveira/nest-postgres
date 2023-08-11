import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { schema } from './schema';
import { migrations } from './migrations/migrations';

export const runMigrations = async (pool: Pool) => {
  const schema = readFileSync('./src/database/schema.sql').toString();
  await pool.query(schema);
};

export const databaseProvider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async () => {
    const pool = new Pool({
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      host: process.env.DATABASE_HOST,
      password: process.env.DATABASE_PASSWORD,
      port: +process.env.DATABASE_PORT,
    });
    await pool.query(schema);
    for (const m in migrations) {
      await pool.query(migrations[m].upgrade);
    }
    return pool;
  },
};
