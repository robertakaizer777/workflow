import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocialService } from '../social/social.service';

@Injectable()
export class PostsProcessor {
  private readonly logger = new Logger(PostsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private socialService: SocialService
  ) {}

  async processJob(jobData: { postId: string, workspaceId: string, platform: string, content: string, mediaUrls: string[] }): Promise<void> {
    const { postId, workspaceId, platform, content, mediaUrls } = jobData;
    this.logger.log(`[SIMULAÇÃO] Iniciando publicação do Post [${postId}] na plataforma [${platform}]`);

    try {
      // 1. Extrair connectionId e formatId (ex: uuid1:::INSTAGRAM_FEED)
      let connectionId = '';
      let formatId = platform;
      
      if (platform.includes(':::')) {
        [connectionId, formatId] = platform.split(':::');
      }

      // 2. Buscar a conexão salva (agora priorizando pelo ID se existir)
      let connection;
      if (connectionId) {
        connection = await this.socialService.getConnectionDecrypted(connectionId);
      } else {
        // Fallback antigo
        const legacyConnections = await this.prisma.socialConnection.findMany({
          where: { workspaceId, platform, status: 'ACTIVE' }
        });
        if (legacyConnections.length > 0) {
           connection = await this.socialService.getConnectionDecrypted(legacyConnections[0].id);
        }
      }

      // Em modo de testes locais, pulamos a checagem rigorosa de contas ativas 
      // se não houver nenhuma conectada, para permitir simular o painel.
      if (!connection) {
        this.logger.warn(`Modo Dev: Nenhuma conta conectada para ${formatId}. Simulando publicação mesmo assim.`);
      }

      // 2. Simulando chamada à rede social
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sucesso
      this.logger.log(`✅ Sucesso na publicação simulada: ${formatId} (Conta: ${connection?.username || 'Desconhecida'})`);
      await this.prisma.post.update({
        where: { id: postId },
        data: { status: 'PUBLISHED', publishedAt: new Date() }
      });

    } catch (error: any) {
      this.logger.error(`❌ Falha no processamento: ${error.message}`);
      await this.prisma.post.update({
        where: { id: postId },
        data: { status: 'FAILED', errorLogs: error.message }
      });
    }
  }
}
