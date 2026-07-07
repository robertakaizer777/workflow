import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MetaService } from './meta.service';
import { SocialCronService } from './social.cron.service';

@Module({
  imports: [PrismaModule],
  controllers: [SocialController],
  providers: [SocialService, MetaService, SocialCronService],
  exports: [SocialService, MetaService, SocialCronService],
})
export class SocialModule {}
