import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { ServiceRepository } from './service.repository';
import { CoachModule } from '../coach/coach.module';

@Module({
  imports: [CoachModule],
  controllers: [ServiceController],
  providers: [ServiceService, ServiceRepository],
  exports: [ServiceService, ServiceRepository],
})
export class ServiceModule {}
