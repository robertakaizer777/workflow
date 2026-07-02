import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SocialModule } from '../social/social.module';

@Module({
  imports: [PrismaModule, SocialModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
