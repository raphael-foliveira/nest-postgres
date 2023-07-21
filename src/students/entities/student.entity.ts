import { Course } from 'src/courses/entities/course.entity';

export class Student {
  id: number;
  name: string;
  course: Course;
  semester: number;
}
