import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { StudentsRepository } from './students.repository';
import { CoursesRepository } from '../courses/courses.repository';

@Injectable()
export class StudentsService {
  constructor(
    private repository: StudentsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<{ id: number }> {
    await this.coursesRepository.findOne(createStudentDto.courseId);
    return this.repository.create(createStudentDto);
  }

  async findAll(): Promise<Student[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<Student> {
    return await this.repository.findOne(id);
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.coursesRepository.findOne(updateStudentDto.courseId);
    return await this.repository.update(id, updateStudentDto);
  }

  async remove(id: number) {
    return await this.repository.remove(id);
  }
}
