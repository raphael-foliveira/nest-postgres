export class Course {
  id: number;
  name: string;
  length: number;
}

export class CourseWithStudents {
  id: number;
  name: string;
  length: number;
  students: {
    name: string;
    semester: number;
  };
}
