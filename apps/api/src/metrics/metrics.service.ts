import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getConsolidatedMetrics(workspaceId: string, activeUsername?: string) {
    // 1. Pega as contas conectadas deste workspace (todas ou apenas as correspondentes ao username)
    const whereClause: any = { workspaceId, status: 'ACTIVE' };
    if (activeUsername) {
      whereClause.username = activeUsername;
    }

    const connections = await this.prisma.socialConnection.findMany({
      where: whereClause,
      select: { id: true, platform: true }
    });

    if (connections.length === 0) {
      return this.emptyMetricsForm();
    }

    const connectionIds = connections.map(c => c.id);

    // 2. Busca as métricas mais recentes de cada conta
    // (Na vida real, haveria um cron job rodando periodicamente e salvando as métricas)
    const metrics = await this.prisma.platformMetric.findMany({
      where: { connectionId: { in: connectionIds } },
      orderBy: { recordedAt: 'desc' }
    });

    // 3. Agregação Consolidada
    let totalFollowers = 0;
    let totalReach = 0;
    let totalImpressions = 0;
    let totalClicks = 0;

    // Filtra apenas o registro mais recente por conexão para a soma global
    const latestMetrics = new Map();
    for (const metric of metrics) {
      if (!latestMetrics.has(metric.connectionId)) {
        latestMetrics.set(metric.connectionId, metric);
        totalFollowers += metric.followers;
        totalReach += metric.reach;
        totalImpressions += metric.impressions;
        totalClicks += metric.clicks;
      }
    }

    // Calcula engajamento médio
    const avgEngagement = Array.from(latestMetrics.values())
      .reduce((acc, curr) => acc + curr.engagementRate, 0) / (latestMetrics.size || 1);

    return {
      overview: {
        followers: totalFollowers,
        reach: totalReach,
        impressions: totalImpressions,
        engagementRate: parseFloat(avgEngagement.toFixed(2)),
        clicks: totalClicks,
        connectedAccounts: connections.length
      },
      breakdownByPlatform: connections.map(c => {
        const metric = latestMetrics.get(c.id);
        return {
          platform: c.platform,
          data: metric || this.emptyMetricsForm().overview
        };
      })
    };
  }

  private emptyMetricsForm() {
    return {
      overview: {
        followers: 0,
        reach: 0,
        impressions: 0,
        engagementRate: 0,
        clicks: 0,
        connectedAccounts: 0
      },
      breakdownByPlatform: []
    };
  }
}
