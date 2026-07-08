import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);

  constructor(private prisma: PrismaService) {}

  async exchangeCodeForToken(code: string, redirectUri: string) {
    const clientId = process.env.META_CLIENT_ID?.trim();
    const clientSecret = process.env.META_CLIENT_SECRET?.trim();
    const url = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        this.logger.error('Erro ao trocar código por token:', data.error);
        throw new Error(data.error.message);
      }

      return data.access_token;
    } catch (err) {
      this.logger.error('Falha de rede ao conectar com a Meta:', err);
      throw new HttpException('Falha na conexão com a Meta', HttpStatus.BAD_GATEWAY);
    }
  }

  async getInstagramBusinessAccounts(accessToken: string) {
    try {
      // 1. Pega as Páginas que o usuário gerencia
      const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
      const pagesData = await pagesRes.json();
      
      if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error('Nenhuma Página do Facebook encontrada para este usuário.');
      }
      
      const accounts = [];

      // 2. Faz um loop por TODAS as páginas para ver quais têm um Instagram conectado
      for (const page of pagesData.data) {
        try {
          const igRes = await fetch(`https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`);
          const igData = await igRes.json();

          if (igData.instagram_business_account) {
            const igAccountId = igData.instagram_business_account.id;

            // 3. Puxa os dados reais da conta do Instagram
            const metricsRes = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}?fields=username,profile_picture_url,followers_count,media_count&access_token=${accessToken}`);
            const metricsData = await metricsRes.json();

            accounts.push({
              id: igAccountId,
              username: '@' + metricsData.username,
              followersCount: metricsData.followers_count,
              mediaCount: metricsData.media_count,
              profilePic: metricsData.profile_picture_url,
            });
          }
        } catch (e) {
          this.logger.warn(`Página ${page.id} não possui IG Business ou falhou.`);
        }
      }

      if (accounts.length === 0) {
        throw new Error('Nenhuma conta comercial do Instagram conectada às suas páginas.');
      }

      return accounts;

    } catch (err) {
      this.logger.error('Falha ao extrair dados do Instagram', err);
      throw new HttpException('Falha ao extrair dados do Instagram. Verifique se sua conta é Profissional/Business.', HttpStatus.BAD_REQUEST);
    }
  }

  async publishInstagramPost(accessToken: string, igAccountId: string, mediaUrls: string[], caption: string) {
    if (!mediaUrls || mediaUrls.length === 0) {
      throw new Error("Mídia obrigatória para publicar no Instagram");
    }

    // A Graph API do Instagram requer hospedar a imagem temporariamente
    const imageUrl = mediaUrls[0]; 

    try {
      // Passo 1: Criar o Container de Mídia
      const containerUrl = `https://graph.facebook.com/v18.0/${igAccountId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`;
      const containerRes = await fetch(containerUrl, { method: 'POST' });
      const containerData = await containerRes.json();

      if (containerData.error) {
        throw new Error(containerData.error.message);
      }

      const creationId = containerData.id;

      // Facebook demora alguns segundos para processar a imagem internamente.
      // Sem esse delay, a API joga o erro "Media ID is not available".
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Passo 2: Publicar o Container
      const publishUrl = `https://graph.facebook.com/v18.0/${igAccountId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`;
      const publishRes = await fetch(publishUrl, { method: 'POST' });
      const publishData = await publishRes.json();

      if (publishData.error) {
        throw new Error(publishData.error.message);
      }

      return publishData.id; // Retorna o ID da postagem oficial
    } catch (err) {
      this.logger.error('Falha ao publicar no Instagram API:', err);
      throw err;
    }
  }
}
