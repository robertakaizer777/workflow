import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SecurityModule } from './security/security.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { SocialModule } from './social/social.module';
import { PostsModule } from './posts/posts.module';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';
import { CrmModule } from './crm/crm.module';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // Cron Jobs (Robôs de fundo)
    ScheduleModule.forRoot(),
    // Lê o .env
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Rate Limiting (Bloqueio de Força Bruta e DDoS)
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 segundos
      limit: 100, // máximo de 100 requisições por minuto por IP
    }]),

    // Database
    PrismaModule,
    
    // Segurança Global
    SecurityModule,
    
    // Autenticação
    AuthModule,
    
    // Multi-tenant (Workspaces)
    WorkspacesModule,
    
    // Conexões de Redes Sociais
    SocialModule,
    
    // Engine de Publicação e Filas
    PostsModule,

    // CRM
    CrmModule,
    
    // Coleta de Métricas
    MetricsModule,
    
    // WebSockets em tempo real
    NotificationsModule,

    // Notificações por e-mail
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
