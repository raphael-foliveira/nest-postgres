import { Test } from '@nestjs/testing';
import { Student } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

describe('StudentsController', () => {
  let controller: StudentsController;
  let mockPool: { query: jest.Mock };

  beforeAll(async () => {
    mockPool = { query: jest.fn() };

    const module = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        StudentsService,
        StudentsRepository,
        { provide: 'DATABASE_CONNECTION', useValue: mockPool },
      ],
    }).compile();
    controller = module.get<StudentsController>(StudentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all students', async () => {
      const result: Student[] = [
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
          course: { id: 1, name: 'Arts', length: 8 },
        },
        ,
      ];
      mockPool.query.mockResolvedValue({
        rows: result.map((s) => ({
          id: s.id,
          name: s.name,
          courseid: s.course.id,
          coursename: s.course.name,
          courselength: s.course.length,
          semester: s.semester,
        })),
      });
      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a student', async () => {
      const result: Student = {
        id: 1,
        name: 'John',
        semester: 1,
        course: { id: 1, name: 'Math', length: 8 },
      };
      mockPool.query.mockResolvedValue({
        rows: [
          {
            id: result.id,
            name: result.name,
            courseid: result.course.id,
            coursename: result.course.name,
            courselength: result.course.length,
            semester: result.semester,
          },
        ],
      });
      expect(await controller.findOne('1')).toEqual(result);
    });

    it('should throw an error when student does not exist', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
      });
      await expect(controller.findOne('1')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a student', async () => {
      const result = { id: 1 };
      mockPool.query.mockResolvedValue({
        rows: [{ id: 1 }],
      });
      expect(
        await controller.create({
          name: 'John',
          courseId: 1,
          semester: 1,
        }),
      ).toEqual(result);
    });

    it('should throw an error when student already exists', async () => {
      mockPool.query.mockResolvedValue({
        rowCount: 0,
      });
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
      mockPool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ updated: 1 }],
      });
      expect(
        await controller.update('1', {
          name: 'John',
          courseId: 1,
          semester: 1,
        }),
      ).toEqual(result);
    });

    it('should throw an error when student does not exist', async () => {
      mockPool.query.mockResolvedValue({
        rowCount: 0,
      });
      await expect(
        controller.update('1', {
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
      mockPool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ deleted: 1 }],
      });
      expect(await controller.remove('1')).toEqual(result);
    });
  });
});
