import { Test } from '@nestjs/testing';
import { Student } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';
import { CoursesRepository } from '../courses/courses.repository';
import { Pool } from 'pg';
import { testDatabaseProvider } from '../../test/test-database.provider';
import { ConfigModule } from '@nestjs/config';
import {
  courseFixtures,
  getFixtures,
  studentsFixtures,
} from '../../test/fixtures/fixtures';
import { Course } from '../../src/courses/entities/course.entity';
import { CreateStudentDto } from './dto/create-student.dto';

describe('StudentsController', () => {
  let controller: StudentsController;
  let pool: Pool;
  let students: Student[];
  let courses: Course[];

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
    it('should return all students', async () => {
      expect(await controller.findAll()).toEqual(students);
    });
  });

  describe('findOne', () => {
    it('should return a student', async () => {
      const student = students[1];
      expect(await controller.findOne(student.id.toString())).toEqual(
        students.find((s) => s.id === student.id),
      );
    });

    it('should throw an error when student does not exist', async () => {
      await expect(controller.findOne(getNonExistingId())).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a student', async () => {
      const student: CreateStudentDto = {
        name: 'John',
        courseId: courses[10].id,
        semester: 1,
      };
      expect(students).not.toContainEqual(await controller.create(student));
    });

    it('should throw an error when student already exists', async () => {
      const { id, ...studentData } = students[0];
      await expect(controller.create(studentData)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      const { id, ...studentData } = students[10];
      const result = { updated: 1 };
      expect(await controller.update(id.toString(), studentData)).toEqual(
        result,
      );
    });

    it('should throw an error when student does not exist', async () => {
      await expect(
        controller.update(getNonExistingId(), {
          name: 'John',
          courseId: 1,
          semester: 1,
        }),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove a student', async () => {
      const student = students[5];
      expect(await controller.remove(student.id.toString())).toEqual({
        deleted: 1,
      });
    });
  });
});
