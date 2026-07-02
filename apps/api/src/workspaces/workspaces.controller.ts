import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  async createWorkspace(@Request() req: any, @Body() body: { name: string }) {
    return this.workspacesService.createWorkspace(req.user.userId, body.name);
  }

  @Get()
  async getMyWorkspaces(@Request() req: any) {
    return this.workspacesService.getMyWorkspaces(req.user.userId);
  }

  @Post('members')
  async addMember(
    @Request() req: any,
    @Body() body: { workspaceId: string; email: string; role: string }
  ) {
    return this.workspacesService.addMember(req.user.userId, body.workspaceId, body.email, body.role);
  }
}
