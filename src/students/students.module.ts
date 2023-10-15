import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { databaseProvider } from 'src/database/database.provider';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

@Module({
  imports: [DatabaseModule],
  controllers: [StudentsController],
  providers: [StudentsService, StudentsRepository, databaseProvider],
})
export class StudentsModule {}
