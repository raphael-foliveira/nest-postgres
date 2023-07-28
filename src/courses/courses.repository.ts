import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesRepository {
  constructor(@Inject('DATABASE_CONNECTION') private client: Pool) {}

  async create(createCourtseDto: CreateCourseDto) {
    try {
      const queryResult = await this.client.query(
        `
        INSERT INTO courses (name, length) VALUES ($1, $2) RETURNING id;
        `,
        [createCourtseDto.name, createCourtseDto.length],
      );
      return queryResult.rows[0];
    } catch (e) {
      console.log(e);
      throw new ConflictException('Course already exists');
    }
  }

  async findAll() {
    const queryResult = await this.client.query(`
        SELECT * FROM courses;
    `);
    return queryResult.rows;
  }

  async findOne(id: number): Promise<Course> {
    const queryResult = await this.client.query(
      `
        SELECT * FROM courses WHERE id = $1;
    `,
      [id],
    );
    if (queryResult.rowCount === 0) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }
    return queryResult.rows[0];
  }
}
