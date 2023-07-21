import { Pool } from 'pg';
import { readFileSync } from 'fs';

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
      port: parseInt(process.env.DATABASE_PORT),
    });
    return pool;
  },
};

export const testDatabaseProvider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async () => {
    console.log('database host:', process.env.DATABASE_HOST);
    const pool = new Pool({
      database: 'test',
      user: process.env.DATABASE_USER,
      host: process.env.DATABASE_HOST,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT),
    });
    return pool;
  },
};
