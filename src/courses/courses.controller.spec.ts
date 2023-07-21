import { Test } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';
import { testDatabaseProvider } from '../database/database.provider';
import { Pool } from 'pg';
import { DatabaseManager } from '../database/database.manager';
import { ConfigModule } from '@nestjs/config';

describe('CoursesController', () => {
  let controller: CoursesController;
  let pool: Pool;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [CoursesController],
      providers: [CoursesService, CoursesRepository, testDatabaseProvider],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
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
    it('should return all courses', async () => {
      const result = [
        { id: 1, name: 'Math', length: 8 },
        { id: 2, name: 'Arts', length: 8 },
      ];
      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a course', async () => {
      const result = {
        id: 1,
        name: 'Math',
        length: 8,
        students: [{ id: 1, name: 'John', semester: 1 }],
      };
      expect(await controller.findOne('1')).toEqual(result);
    });

    it('should throw an error if the course does not exist', async () => {
      await expect(controller.findOne('99')).rejects.toThrowError(
        'Course with id 99 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a course', async () => {
      const result = { id: 3 };
      expect(
        await controller.create({
          name: 'Law',
          length: 10,
        }),
      ).toEqual(result);
    });

    it('should throw an error if the course already exists', async () => {
      await expect(
        controller.create({
          name: 'Math',
          length: 8,
        }),
      ).rejects.toThrowError('Course already exists');
    });
  });
});
