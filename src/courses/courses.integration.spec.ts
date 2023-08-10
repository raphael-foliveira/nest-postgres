import { ConfigModule } from '@nestjs/config';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import * as supertest from 'supertest';
import {
  addFixtures,
  deleteFixtures,
  getFixtures,
} from '../../test/fixtures/fixtures';
import { testDatabaseProvider } from '../../test/test-database.provider';
import { CoursesController } from './courses.controller';
import { CoursesRepository } from './courses.repository';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { TerminusModule } from '@nestjs/terminus';

describe('CoursesController', () => {
  let pool: Pool;
  let courses: Course[];
  let app: NestApplication;

  const getNonExistingId = () => {
    let nonExistingId = 1;
    while (courses.map((c) => c.id).includes(nonExistingId)) {
      nonExistingId++;
    }
    return nonExistingId.toString();
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TerminusModule, ConfigModule.forRoot()],
      controllers: [CoursesController],
      providers: [CoursesService, CoursesRepository, testDatabaseProvider],
    }).compile();
    pool = module.get<Pool>('DATABASE_CONNECTION');
    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await addFixtures(pool);

    const fixtures = await getFixtures(pool);
    courses = fixtures.courses;
  });

  afterEach(async () => {
    await deleteFixtures(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      return supertest(app.getHttpServer())
        .get('/courses')
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(courses);
        });
    });
  });

  describe('findOne', () => {
    it('should return a course', async () => {
      const course = courses[0];
      return supertest(app.getHttpServer())
        .get(`/courses/${course.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(course);
        });
    });

    it('should throw an error if the course does not exist', async () => {
      const id = getNonExistingId();
      return supertest(app.getHttpServer()).get(`/courses/${id}`).expect(404);
    });
  });

  describe('create', () => {
    it('should create a course', async () => {
      return supertest(app.getHttpServer())
        .post('/courses')
        .send({
          name: 'Math',
          length: 8,
        })
        .expect(201)
        .then((res) => {
          expect(courses).not.toContainEqual(res.body);
        });
    });

    it('should throw an error if the course already exists', async () => {
      const { id, ...course } = courses[1];
      return supertest(app.getHttpServer())
        .post('/courses')
        .send(course)
        .expect(409);
    });
  });
});
