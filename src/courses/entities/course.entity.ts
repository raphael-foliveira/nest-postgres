import { Student } from 'src/students/entities/student.entity';

export class Course {
  id: number;
  name: string;
  length: number;
}

export class CourseWithStudents {
  id: number;
  name: string;
  length: number;
  students: Student[];
}
