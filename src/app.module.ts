import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { databaseProvider } from './database/database.provider';
import { StudentsModule } from './students/students.module';
import { ConfigModule } from '@nestjs/config';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    DatabaseModule,
    StudentsModule,
    ConfigModule.forRoot(),
    CoursesModule,
  ],
  providers: [databaseProvider],
})
export class AppModule {}
