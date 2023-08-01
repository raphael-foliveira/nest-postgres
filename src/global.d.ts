import { Pool } from 'pg';

declare namespace NodeJS {
  interface Global {
    __POOL__: Pool;
  }
}
