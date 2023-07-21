import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import { testDatabaseProvider } from '../database/database.provider';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseManager } from '../database/database.manager';
import { CoursesRepository } from '../courses/courses.repository';

describe('StudentsController', () => {
  let controller: StudentsController;
  let pool: Pool;

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
    const manager = new DatabaseManager(pool);
    await manager.cleanDatabase();
    await manager.runMigrations();
    await manager.insertFixtures();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all students', async () => {
      const result = [
        {
          id: 1,
          name: 'John',
          semester: 1,
          course: { id: 1, name: 'Math', length: 8 },
        },
        {
          id: 2,
          name: 'Doe',
          semester: 1,
          course: { id: 2, name: 'Arts', length: 8 },
        },
        ,
      ];

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a student', async () => {
      const result = {
        id: 1,
        name: 'John',
        semester: 1,
        course: { id: 1, name: 'Math', length: 8 },
      };

      expect(await controller.findOne('1')).toEqual(result);
    });

    it('should throw an error when student does not exist', async () => {
      await expect(controller.findOne('99')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a student', async () => {
      const result = { id: 3 };
      expect(
        await controller.create({
          name: 'Ron',
          courseId: 1,
          semester: 1,
        }),
      ).toEqual(result);
    });

    it('should throw an error when student already exists', async () => {
      await expect(
        controller.create({
          name: 'John',
          courseId: 1,
          semester: 1,
        }),
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      const result = { updated: 1 };
      expect(
        await controller.update('1', {
          name: 'John',
          courseId: 1,
          semester: 1,
        }),
      ).toEqual(result);
    });

    it('should throw an error when student does not exist', async () => {
      await expect(
        controller.update('99', {
          name: 'John',
          courseId: 1,
          semester: 1,
        }),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove a student', async () => {
      const result = { deleted: 1 };
      expect(await controller.remove('1')).toEqual(result);
    });
  });
});
