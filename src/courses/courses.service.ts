import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CoursesRepository } from './courses.repository';

@Injectable()
export class CoursesService {
  constructor(private repository: CoursesRepository) {}

  create(createCourseDto: CreateCourseDto) {
    return this.repository.create(createCourseDto);
  }

  findAll() {
    return this.repository.findAll();
  }

  findOne(id: number) {
    return this.repository.findOne(id);
  }
}
