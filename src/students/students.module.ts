import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { DatabaseModule } from 'src/database/database.module';
import { databaseProvider } from 'src/database/database.provider';
import { StudentsRepository } from './students.repository';
import { CoursesRepository } from 'src/courses/courses.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [StudentsController],
  providers: [
    StudentsService,
    StudentsRepository,
    CoursesRepository,
    databaseProvider,
  ],
})
export class StudentsModule {}
