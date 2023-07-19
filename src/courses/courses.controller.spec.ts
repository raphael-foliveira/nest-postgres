import { Test } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';

describe('CoursesController', () => {
  let controller: CoursesController;
  let mockPool: { query: jest.Mock };

  beforeAll(async () => {
    mockPool = { query: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        CoursesService,
        CoursesRepository,
        { provide: 'DATABASE_CONNECTION', useValue: mockPool },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
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
      mockPool.query.mockResolvedValue({
        rows: result.map((c) => ({
          id: c.id,
          name: c.name,
          length: c.length,
        })),
      });
      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a course', async () => {
      const result = {
        id: 1,
        name: 'Math',
        length: 8,
        students: [
          { id: 1, name: 'john', semester: 1 },
          { id: 2, name: 'doe', semester: 2 },
        ],
      };
      mockPool.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: result.id,
              name: result.name,
              length: result.length,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: result.students,
        });
      expect(await controller.findOne('1')).toEqual(result);
    });

    it('should throw an error if the course does not exist', async () => {
      mockPool.query.mockResolvedValueOnce({
        rowCount: 0,
      });
      await expect(controller.findOne('1')).rejects.toThrowError(
        'Course with id 1 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a course', async () => {
      const result = { id: 1 };
      mockPool.query.mockResolvedValueOnce({
        rows: [result],
      });
      expect(
        await controller.create({
          name: 'Math',
          length: 8,
        }),
      ).toEqual(result);
    });

    it('should throw an error if the course already exists', async () => {
      mockPool.query.mockResolvedValueOnce({
        rowCount: 0,
      });
      await expect(
        controller.create({
          name: 'Math',
          length: 8,
        }),
      ).rejects.toThrowError('Course already exists');
    });
  });
});
