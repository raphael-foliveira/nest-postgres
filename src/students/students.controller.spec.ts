import { Test } from '@nestjs/testing';
import { Student } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';
import { CoursesRepository } from '../courses/courses.repository';
import { Pool } from 'pg';
import { testDatabaseProvider } from '../../test/test-database.provider';
import { ConfigModule } from '@nestjs/config';
import { addFixtures, getFixtures } from '../../test/fixtures/fixtures';
import { Course } from '../../src/courses/entities/course.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import * as supertest from 'supertest';
import { NestApplication } from '@nestjs/core';

describe('StudentsController', () => {
  let controller: StudentsController;
  let pool: Pool;
  let students: Student[];
  let courses: Course[];
  let app: NestApplication;

  const getNonExistingId = () => {
    let nonExistingId = 1;
    while (students.map((s) => s.id).includes(nonExistingId)) {
      nonExistingId++;
    }
    return nonExistingId.toString();
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [StudentsController],
      providers: [
        StudentsService,
        StudentsRepository,
        CoursesRepository,
        testDatabaseProvider,
      ],
    }).compile();
    controller = module.get<StudentsController>(StudentsController);
    pool = module.get<Pool>('DATABASE_CONNECTION');
    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await addFixtures(pool);

    const fixtures = await getFixtures(pool);
    students = fixtures.students;
    courses = fixtures.courses;
  });

  afterEach(async () => {
    await pool.query('DELETE FROM students');
    await pool.query('DELETE FROM courses');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      const student = students[1];
      console.log(student);
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
        courseId: courses[10].id,
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
      const { id, ...studentData } = students[0];
      return supertest(app.getHttpServer())
        .post('/students')
        .send(studentData)
        .expect(409);
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      const { id, ...studentData } = students[10];
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
      const student = students[5];
      return supertest(app.getHttpServer())
        .delete(`/students/${student.id}`)
        .expect(204);
    });
  });
});
