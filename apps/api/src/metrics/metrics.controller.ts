import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('consolidated/:workspaceId')
  async getConsolidated(
    @Param('workspaceId') workspaceId: string,
    @Query('username') username?: string
  ) {
    return this.metricsService.getConsolidatedMetrics(workspaceId, username);
  }
}
