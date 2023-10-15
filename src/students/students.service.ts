import { ConflictException, Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(private repository: StudentsRepository) {}

  async create(createStudentDto: CreateStudentDto): Promise<{ id: number }> {
    return await this.repository.create(createStudentDto);
  }

  async findAll(): Promise<Student[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<Student> {
    return await this.repository.findOne(id);
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    return await this.repository.update(id, updateStudentDto);
  }

  async remove(id: number) {
    return await this.repository.remove(id);
  }
}
