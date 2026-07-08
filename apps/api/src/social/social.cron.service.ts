import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MetaService } from './meta.service';
import { SocialService } from './social.service';

@Injectable()
export class SocialCronService {
  private readonly logger = new Logger(SocialCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metaService: MetaService,
    private readonly socialService: SocialService,
  ) {}

  /**
   * ROBÔ DE MÉTRICAS (Opção A)
   * Roda a cada hora para sincronizar dados do Instagram/Facebook
   */
  @Cron(CronExpression.EVERY_HOUR)
  async syncMetrics() {
    this.logger.log('Iniciando sincronização de métricas das contas sociais...');
    
    // 1. Busca todas as conexões ativas
    const rawConnections = await this.prisma.socialConnection.findMany({
      where: { status: 'ACTIVE', platform: { in: ['INSTAGRAM', 'FACEBOOK'] } }
    });

    for (const rawConn of rawConnections) {
      try {
        // Descriptografa o token usando o service
        const conn = await this.socialService.getConnectionDecrypted(rawConn.id);
        if (!conn) continue;
        
        if (conn.platform === 'INSTAGRAM') {
          // Puxa as métricas atuais usando a Meta API
          const metricsRes = await fetch(`https://graph.facebook.com/v18.0/${conn.pageId}?fields=followers_count,media_count&access_token=${conn.accessToken}`);
          const metricsData = await metricsRes.json();
          
          if (!metricsData.error) {
            // Salva na tabela PlatformMetric
            await this.prisma.platformMetric.create({
              data: {
                connectionId: conn.id,
                followers: metricsData.followers_count || 0,
                reach: 0, // Precisaria da Graph API de Insights para alcance real
                impressions: metricsData.media_count || 0,
                engagementRate: 0,
                clicks: 0,
              }
            });
            this.logger.log(`Métricas sincronizadas para a conta ${conn.username} (${conn.platform})`);
          } else {
            this.logger.warn(`Erro ao buscar métricas para ${conn.username}: ${metricsData.error.message}`);
          }
        }
      } catch (error) {
        this.logger.error(`Falha ao sincronizar métricas da conexão ${rawConn.id}`, error);
      }
    }
  }

  /**
   * ROBÔ DE PUBLICAÇÃO (Opção B)
   * Roda a cada minuto verificando se há posts para publicar agora
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledPosts() {
    this.logger.log('Verificando fila de posts agendados...');
    
    // 1. Busca todos os posts com status 'DRAFT' ou 'SCHEDULED' que a data já chegou
    const posts = await this.prisma.post.findMany({
      where: {
        status: { in: ['DRAFT', 'SCHEDULED'] },
        scheduledFor: { lte: new Date() } // Data e hora já passou ou é agora
      }
    });

    for (const post of posts) {
      try {
        this.logger.log(`Processando publicação do post ${post.id}...`);
        
        // Vamos parsear as plataformas e mediaUrls (estão em string JSON no banco SQLite/Postgres)
        const platforms = JSON.parse(post.platforms || '[]');
        const mediaUrls = JSON.parse(post.mediaUrls || '[]');
        
        // Filtra todas as plataformas que são de INSTAGRAM
        const instagramPlatforms = platforms.filter((p: string) => p.includes('INSTAGRAM'));
        
        for (const igPlatform of instagramPlatforms) {
          const connectionId = igPlatform.split(':::')[0];

          // Busca a conexão EXATA que o usuário escolheu
          const rawConn = await this.prisma.socialConnection.findUnique({
            where: { id: connectionId }
          });

          if (rawConn && rawConn.status === 'ACTIVE') {
            const connection = await this.socialService.getConnectionDecrypted(rawConn.id);
            if (connection) {
              // Publica de verdade na Meta API
              const postId = await this.metaService.publishInstagramPost(
                connection.accessToken,
                connection.pageId, // igAccountId guardado em pageId
                mediaUrls,
                post.content
              );
              this.logger.log(`Post [${post.id}] publicado na conta EXATA ${connection.username} (ID Meta: ${postId})`);
            }
          } else {
             this.logger.warn(`Conexão ${connectionId} não encontrada ou inativa para o post ${post.id}.`);
          }
        }

        // Marca como publicado
        await this.prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          }
        });
        
      } catch (error) {
        this.logger.error(`Erro ao publicar post ${post.id}`, error);
        await this.prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'FAILED',
            errorLogs: String(error),
          }
        });
      }
    }
  }
}
