import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, Query, Res } from '@nestjs/common';
import { SocialService } from './social.service';
import { MetaService } from './meta.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@Controller('social')
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly metaService: MetaService
  ) {}

  @Get(':workspaceId')
  @UseGuards(JwtAuthGuard)
  async getConnections(@Param('workspaceId') workspaceId: string) {
    return this.socialService.getWorkspaceConnections(workspaceId);
  }

  // 1. INÍCIO DO FLUXO OAUTH (REDIRECIONAMENTO)
  @Get('auth/:platform')
  async initiateOAuth(
    @Param('platform') platform: string,
    @Query('workspaceId') workspaceId: string,
    @Query('token') token: string, // Recebemos o token via querystring para o callback saber quem é
    @Res() res: Response
  ) {
    if (!workspaceId) {
      return res.status(400).send("Workspace ID é obrigatório para iniciar a conexão.");
    }

    // O redirectUri NÃO pode ter query parameters dinâmicos no Facebook (precisa ser exato)
    const redirectUri = `http://localhost:4001/social/callback/oauth`;
    
    // Passamos tudo empacotado no STATE
    const statePayload = Buffer.from(JSON.stringify({ token, workspaceId, platform })).toString('base64');
    
    // Variáveis de Ambiente Reais que virão do arquivo .env
    const clientId = process.env.META_CLIENT_ID; 
    
    let oauthUrl = '';

    switch (platform.toUpperCase()) {
      case 'INSTAGRAM':
      case 'FACEBOOK':
        // Fluxo Oficial da Meta (Facebook / Instagram Graph API)
        oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish&response_type=code&state=${statePayload}`;
        break;
        
      case 'YOUTUBE':
        // Fluxo Oficial do Google / YouTube Data API
        oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly&access_type=offline&prompt=consent&state=${statePayload}`;
        break;
        
      case 'LINKEDIN':
        // Fluxo Oficial do LinkedIn
        oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${statePayload}&scope=w_member_social%20r_liteprofile`;
        break;
        
      case 'TIKTOK':
        // Fluxo Oficial do TikTok for Developers
        oauthUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientId}&response_type=code&scope=user.info.basic,video.publish,video.list&redirect_uri=${redirectUri}&state=${statePayload}`;
        break;
        
      default:
        return res.status(400).send("Plataforma não suportada.");
    }

    // Redireciona o usuário para a página de permissão oficial da rede social
    return res.redirect(oauthUrl);
  }

  // 2. RETORNO DA REDE SOCIAL (CALLBACK COM O CÓDIGO)
  @Get('callback/oauth')
  async handleOAuthReturn(
    @Query('code') code: string,
    @Query('state') state: string, // State com token, workspaceId e platform
    @Res() res: Response
  ) {
    if (!code || !state) {
      return res.redirect('http://localhost:3000/integrations?error=access_denied');
    }

    try {
      // Extrai os dados do state
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
      const { token, workspaceId, platform } = decodedState;

      if (!platform) {
        throw new Error('Platform missing in state');
      }

      if (platform.toUpperCase() === 'INSTAGRAM' || platform.toUpperCase() === 'FACEBOOK') {
        // 1. Troca o código pelo token permanente
        const redirectUri = `http://localhost:4001/social/callback/oauth`; // Mesma redirect_uri exata usada na ida
        const accessToken = await this.metaService.exchangeCodeForToken(code, redirectUri);
        
        // 2. Puxa os dados reais de TODAS as contas do Instagram conectadas
        const igAccounts = await this.metaService.getInstagramBusinessAccounts(accessToken);
        
        // 3. Salva no banco de dados para cada conta encontrada
        for (const account of igAccounts) {
          const connection = await this.socialService.saveOAuthToken(
            workspaceId,
            platform.toUpperCase(),
            account.id, // pageId (igAccountId)
            account.username, // username
            accessToken,
            undefined, // refreshToken
            undefined  // expiresIn
          );

          // BÔNUS: Salvar as métricas atuais puxadas da API
          // Você deve importar o PrismaService ou MetricsService para isso, mas como estamos no controller,
          // podemos chamar um método do SocialService ou fazer aqui (vamos assumir que será feito dps via cron)
        }
      } else {
        // Fallback simulado para as outras redes
        const fakeAccessToken = `fake_token_${Math.random().toString(36).substr(2, 8)}`;
        const fakeAccountId = `1002938${Math.floor(Math.random() * 1000)}`;
        const fakeAccountName = `@suaconta_${platform.toLowerCase()}`;

        await this.socialService.saveOAuthToken(
          workspaceId,
          platform.toUpperCase(),
          fakeAccountId, // pageId
          fakeAccountName, // username
          fakeAccessToken,
          undefined, 
          undefined  
        );
      }

      // Redireciona de volta para o Dashboard com mensagem de Sucesso
      return res.redirect('http://localhost:3000/integrations?success=true');
    } catch (error) {
      console.error("Erro no callback OAuth", error);
      return res.redirect('http://localhost:3000/integrations?error=sync_failed');
    }
  }

  // Mantido para compatibilidade com o frontend atual ou inserções manuais
  @Post('callback')
  @UseGuards(JwtAuthGuard)
  async handleOAuthCallback(
    @Request() req: any,
    @Body() body: {
      workspaceId: string;
      platform: string;
      pageId: string;
      username: string;
      accessToken: string;
      refreshToken?: string;
      expiresIn?: number;
    }
  ) {
    return this.socialService.saveOAuthToken(
      body.workspaceId,
      body.platform,
      body.pageId,
      body.username,
      body.accessToken,
      body.refreshToken,
      body.expiresIn
    );
  }

  @Delete(':workspaceId/:connectionId')
  @UseGuards(JwtAuthGuard)
  async removeConnection(
    @Param('workspaceId') workspaceId: string,
    @Param('connectionId') connectionId: string
  ) {
    return this.socialService.removeConnection(workspaceId, connectionId);
  }
}
