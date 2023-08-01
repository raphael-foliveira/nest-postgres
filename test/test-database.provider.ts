import { Provider } from '@nestjs/common';
import { Pool } from 'pg';
import { migrations } from '../src/database/migrations/migrations';
import { schema } from '../src/database/schema';

export const testDatabaseProvider: Provider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async () => {
    const pool = new Pool({
      database: process.env.TEST_DATABASE_NAME,
      user: process.env.TEST_DATABASE_USER,
      host: process.env.TEST_DATABASE_HOST,
      password: process.env.TEST_DATABASE_PASSWORD,
      port: +process.env.TEST_DATABASE_PORT,
    });
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await pool.query(schema);
    for (const migration of migrations) {
      await pool.query(migration.upgrade);
    }

    return pool;
  },
};
