import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { DatabaseModule } from 'src/database/database.module';
import { CoursesRepository } from './courses.repository';
import { databaseProvider } from 'src/database/database';

@Module({
  imports: [DatabaseModule],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesRepository, databaseProvider],
  exports: [CoursesService],
})
export class CoursesModule {}
