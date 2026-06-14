import { Module } from '@nestjs/common';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';
import { CoachRepository } from './coach.repository';

@Module({
  controllers: [CoachController],
  providers: [CoachService, CoachRepository],
  exports: [CoachService, CoachRepository],
})
export class CoachModule {}
