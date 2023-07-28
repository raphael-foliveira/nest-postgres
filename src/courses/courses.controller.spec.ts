import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import { Student } from 'src/students/entities/student.entity';
import {
  courseFixtures,
  getFixtures,
  studentsFixtures,
} from '../../test/fixtures/fixtures';
import { testDatabaseProvider } from '../../test/test-database.provider';
import { CoursesController } from './courses.controller';
import { CoursesRepository } from './courses.repository';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';

describe('CoursesController', () => {
  let controller: CoursesController;
  let pool: Pool;
  let students: Student[];
  let courses: Course[];

  const getNonExistingId = () => {
    let nonExistingId = 1;
    while (courses.map((c) => c.id).includes(nonExistingId)) {
      nonExistingId++;
    }
    return nonExistingId.toString();
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [CoursesController],
      providers: [CoursesService, CoursesRepository, testDatabaseProvider],
    }).compile();
    controller = module.get<CoursesController>(CoursesController);
    pool = module.get<Pool>('DATABASE_CONNECTION');
  });

  beforeEach(async () => {
    await pool.query(courseFixtures());
    const courseIds = await pool.query('SELECT id FROM courses');
    await pool.query(studentsFixtures(courseIds.rows.map((r) => r.id)));

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
    it('should return all courses', async () => {
      expect(await controller.findAll()).toEqual(courses);
    });
  });

  describe('findOne', () => {
    it('should return a course', async () => {
      const course = courses[0];
      expect(await controller.findOne(course.id.toString())).toEqual(course);
    });

    it('should throw an error if the course does not exist', async () => {
      const id = getNonExistingId();
      await expect(controller.findOne(id)).rejects.toThrowError(
        `Course with id ${id} not found`,
      );
    });
  });

  describe('create', () => {
    it('should create a course', async () => {
      expect(courses).not.toContainEqual(
        await controller.create({
          name: 'Math',
          length: 8,
        }),
      );
    });

    it('should throw an error if the course already exists', async () => {
      const { id, ...course } = courses[1];
      await expect(controller.create(course)).rejects.toThrowError(
        'Course already exists',
      );
    });
  });
});
