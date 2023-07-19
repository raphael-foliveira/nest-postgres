import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { DatabaseModule } from 'src/database/database.module';
import { databaseProvider } from 'src/database/database';
import { StudentsRepository } from './students.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [StudentsController],
  providers: [StudentsService, StudentsRepository, databaseProvider],
})
export class StudentsModule {}
