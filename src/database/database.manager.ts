import { readFileSync } from 'fs';
import { Pool } from 'pg';

export class DatabaseManager {
  constructor(private pool: Pool) {}

  async runMigrations() {
    const schema = readFileSync('./src/database/schema.sql').toString();
    await this.pool.query(schema);
  }

  async cleanDatabase() {
    await this.pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  }

  async insertFixtures() {
    const students = [
      {
        id: 1,
        name: 'John',
        semester: 1,
        courseId: 1,
      },
      {
        id: 2,
        name: 'Doe',
        semester: 1,
        courseId: 2,
      },
      ,
    ];

    const courses = [
      { id: 1, name: 'Math', length: 8 },
      { id: 2, name: 'Arts', length: 8 },
    ];

    await this.pool.query(
      'INSERT INTO courses (name, length) VALUES ($1, $2), ($3, $4)',
      [courses[0].name, courses[0].length, courses[1].name, courses[1].length],
    );
    await this.pool.query(
      'INSERT INTO students (name, semester, courseid) VALUES ($1, $2, $3), ($4, $5, $6)',
      [
        students[0].name,
        students[0].semester,
        students[0].courseId,
        students[1].name,
        students[1].semester,
        students[1].courseId,
      ],
    );
  }
}
