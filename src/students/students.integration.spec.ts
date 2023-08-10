import { ConfigModule } from '@nestjs/config';
import { NestApplication } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import { Pool, PoolClient } from 'pg';
import * as supertest from 'supertest';
import {
  addFixtures,
  deleteFixtures,
  getFixtures,
} from '../../test/fixtures/fixtures';
import { testDatabaseProvider } from '../../test/test-database.provider';
import { CoursesRepository } from '../courses/courses.repository';
import { Course } from '../courses/entities/course.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { Student } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

describe('students integration', () => {
  let pool: Pool;
  let students: Student[];
  let courses: Course[];
  let app: NestApplication;
  let client: PoolClient;

  const randomStudent = () => {
    return students[Math.floor(Math.random() * students.length)];
  };

  const randomCourse = () => {
    return courses[Math.floor(Math.random() * courses.length)];
  };

  const getNonExistingId = () => {
    let nonExistingId = 1;
    while (students.map((s) => s.id).includes(nonExistingId)) {
      nonExistingId++;
    }
    return nonExistingId.toString();
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TerminusModule, ConfigModule.forRoot()],
      controllers: [StudentsController],
      providers: [
        StudentsService,
        StudentsRepository,
        CoursesRepository,
        testDatabaseProvider,
      ],
    }).compile();
    pool = module.get<Pool>('DATABASE_CONNECTION');
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await addFixtures(pool);

    const fixtures = await getFixtures(pool);
    students = fixtures.students;
    courses = fixtures.courses;
  });

  afterEach(async () => {
    await deleteFixtures(pool);
  });

  describe('findAll', () => {
    it('should return all students', async () => {
      return supertest(app.getHttpServer())
        .get('/students')
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(students);
        });
    });
  });

  describe('findOne', () => {
    it('should return a student', () => {
      const student = randomStudent();
      return supertest(app.getHttpServer())
        .get(`/students/${student.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(student);
        });
    });

    it('should throw an error when student does not exist', async () => {
      return supertest(app.getHttpServer())
        .get(`/students/${getNonExistingId()}`)
        .expect(404);
    });
  });

  describe('create', () => {
    it('should create a student', async () => {
      const student: CreateStudentDto = {
        name: 'John',
        courseId: randomCourse().id,
        semester: 1,
      };
      return supertest(app.getHttpServer())
        .post('/students')
        .send(student)
        .expect(201)
        .then((res) => {
          expect(students).not.toContainEqual(res.body);
        });
    });

    it('should throw an error when student already exists', async () => {
      const { id, ...studentData } = randomStudent();
      return supertest(app.getHttpServer())
        .post('/students')
        .send(studentData)
        .expect(409);
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      const { id, ...studentData } = randomStudent();
      const result = { updated: 1 };
      return supertest(app.getHttpServer())
        .patch(`/students/${id}`)
        .send(studentData)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(result);
        });
    });

    it('should throw an error when student does not exist', async () => {
      return supertest(app.getHttpServer())
        .patch(`/students/${getNonExistingId()}`)
        .expect(404);
    });
  });

  describe('remove', () => {
    it('should remove a student', async () => {
      const student = randomStudent();
      return supertest(app.getHttpServer())
        .delete(`/students/${student.id}`)
        .expect(204);
    });
  });
});
