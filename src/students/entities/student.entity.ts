export class Student {
  id: number;
  name: string;
  course: {
    id: number;
    name: string;
    length: number;
  };
  semester: number;
}
