import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../security/encryption.service';

@Injectable()
export class SocialService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService
  ) {}

  async updateWorkspaceMetaSettings(workspaceId: string, metaAppId: string, metaAppSecret: string) {
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        metaAppId,
        metaAppSecret: this.encryption.encrypt(metaAppSecret)
      }
    });
  }

  async getWorkspaceMetaSettings(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { metaAppId: true, metaAppSecret: true }
    });

    if (workspace?.metaAppSecret) {
      workspace.metaAppSecret = this.encryption.decrypt(workspace.metaAppSecret);
    }
    return workspace;
  }

  async getWorkspaceConnections(workspaceId: string) {
    const connections = await this.prisma.socialConnection.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    // Sanitizar resposta: NUNCA retornar access tokens para o frontend
    return connections.map(c => {
      const { accessToken, refreshToken, ...safeData } = c;
      return safeData;
    });
  }

  async getConnectionDecrypted(connectionId: string) {
    const connection = await this.prisma.socialConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) return null;

    connection.accessToken = this.encryption.decrypt(connection.accessToken);
    if (connection.refreshToken) {
      connection.refreshToken = this.encryption.decrypt(connection.refreshToken);
    }
    
    return connection;
  }

  async saveOAuthToken(
    workspaceId: string, 
    platform: string, 
    pageId: string, 
    username: string, 
    accessToken: string, 
    refreshToken?: string, 
    expiresInSeconds?: number
  ) {
    const expiresAt = expiresInSeconds 
      ? new Date(Date.now() + expiresInSeconds * 1000) 
      : null;

    // Criptografando tokens antes de gravar
    const encryptedAccess = this.encryption.encrypt(accessToken);
    const encryptedRefresh = refreshToken ? this.encryption.encrypt(refreshToken) : null;

    return this.prisma.socialConnection.upsert({
      where: {
        workspaceId_platform_pageId: { workspaceId, platform, pageId }
      },
      update: {
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        expiresAt,
        username,
        status: 'ACTIVE'
      },
      create: {
        workspaceId,
        platform,
        pageId,
        username,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        expiresAt,
        status: 'ACTIVE'
      }
    });
  }

  async removeConnection(workspaceId: string, connectionId: string) {
    const connection = await this.prisma.socialConnection.findFirst({
      where: { id: connectionId, workspaceId }
    });

    if (!connection) {
      throw new NotFoundException('Conexão não encontrada neste workspace.');
    }

    await this.prisma.socialConnection.delete({
      where: { id: connectionId }
    });
    
    return { success: true };
  }
}
