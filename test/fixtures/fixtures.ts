import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

const courseFixtures = () => {
  const numberOfCourses = 5;

  let query = 'INSERT INTO courses (name, length) VALUES ';
  for (let i = 1; i <= numberOfCourses; i++) {
    query += `('Course ${i}', ${Math.floor(Math.random() * 10)}),`;
    if (i === numberOfCourses) {
      query = query.slice(0, -1);
      query += ';';
    }
  }
  return query;
};

const studentsFixtures = (courseIds: number[]) => {
  const numberOfStudents = 10;
  let query = 'INSERT INTO students (name, courseId, semester) VALUES\n';
  for (let i = 1; i <= numberOfStudents; i++) {
    query += `('${faker.person.fullName().replace(`'`, ``)}', ${Math.floor(
      courseIds[Math.floor(Math.random() * courseIds.length)],
    )}, ${Math.floor(Math.random() * 9 + 1)}),\n`;
    if (i === numberOfStudents) {
      query = query.slice(0, -2);
      query += ';';
    }
  }
  return query;
};

export const addFixtures = async (pool: Pool) => {
  await pool.query(courseFixtures());
  const courseIds = await pool.query('SELECT id FROM courses');
  await pool.query(studentsFixtures(courseIds.rows.map((r) => r.id)));
};

export const deleteFixtures = async (pool: Pool) => {
  await pool.query('DELETE FROM students');
  await pool.query('DELETE FROM courses');
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
