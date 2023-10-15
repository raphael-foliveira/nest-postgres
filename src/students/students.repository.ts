import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsRepository {
  constructor(@Inject('DATABASE_CONNECTION') private client: Pool) {}

  async create(createStudentDto: CreateStudentDto) {
    await this.checkIfCourseExists(createStudentDto.courseId);
    const insertResult = await this.client.query(
      'INSERT INTO students (name, courseId, semester) VALUES ($1, $2, $3) RETURNING id',
      [
        createStudentDto.name,
        createStudentDto.courseId,
        createStudentDto.semester,
      ],
    );
    return insertResult.rows[0];
  }

  async findAll() {
    const queryResult = await this.client.query(
      `
      SELECT 
      s.id as id, 
      s.name as name, 
      s.courseId as courseId, 
      c.name as courseName, 
      s.semester as semester, 
      c.length as courseLength 
      FROM students s JOIN courses c on s.courseId = c.id;
      `,
    );
    return queryResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      courseId: row.courseid,
      semester: row.semester,
    }));
  }

  async findOne(id: number) {
    const queryResult = await this.client.query(
      `SELECT 
      s.id as id, 
      s.name as name, 
      s.courseId as courseId, 
      c.name as courseName, 
      s.semester as semester, 
      c.length as courseLength 
      FROM students s JOIN courses c on s.courseId = c.id 
      WHERE s.id = $1;`,
      [id],
    );
    if (queryResult.rows.length === 0) {
      throw new NotFoundException(`Student with id ${id} does not exist`);
    }
    const { name, courseid, semester } = queryResult.rows[0];
    return {
      id,
      name,
      courseId: courseid,
      semester,
    };
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    if (updateStudentDto.courseId) {
      await this.checkIfCourseExists(updateStudentDto.courseId);
    }
    await this.client.query('BEGIN');
    try {
      await this.findOne(id);
      const updateParams = Object.entries(updateStudentDto);
      const queryResult = await this.client.query(
        `UPDATE students SET ${updateParams.map(
          ([key, _], index) => `${key} = $${index + 2}`,
        )} WHERE id = $1`,
        [id, ...updateParams.map(([_, value]) => value)],
      );
      await this.client.query('COMMIT');
      return { updated: queryResult.rowCount };
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    const queryResult = await this.client.query(
      'DELETE FROM students WHERE id = $1',
      [id],
    );
    return { deleted: queryResult.rowCount };
  }

  private async checkIfCourseExists(courseId: number) {
    const course = await this.client.query(
      `
      SELECT * FROM courses WHERE id = $1;
    `,
      [courseId],
    );
    if (course.rowCount === 0) {
      throw new NotFoundException('Course not found');
    }
  }
}
