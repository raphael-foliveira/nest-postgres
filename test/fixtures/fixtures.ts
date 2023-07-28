import { Pool } from 'pg';

export const courseFixtures = () => {
  let query = 'INSERT INTO courses (name, length) VALUES ';
  for (let i = 1; i <= 15; i++) {
    query += `('Course ${i}', ${Math.floor(Math.random() * 10)}),`;
    if (i === 15) {
      query = query.slice(0, -1);
      query += ';';
    }
  }
  return query;
};

export const studentsFixtures = (courseIds: number[]) => {
  let query = 'INSERT INTO students (name, courseId, semester) VALUES ';
  for (let i = 1; i <= 40; i++) {
    query += `('Student ${i}', ${Math.floor(
      courseIds[Math.floor(Math.random() * courseIds.length)],
    )}, ${Math.floor(Math.random() * 10)}), `;
    if (i === 40) {
      query = query.slice(0, -2);
      query += ';';
    }
  }
  return query;
};

export const getFixtures = async (pool: Pool) => {
  return {
    students: await pool
      .query('SELECT id, name, courseid, semester FROM students')
      .then((res) =>
        res.rows.map((r) => {
          const { courseid, ...studentData } = r;
          return {
            ...studentData,
            courseId: courseid,
          };
        }),
      ),
    courses: await pool
      .query('SELECT id, name, length FROM courses')
      .then((res) => res.rows),
  };
};
