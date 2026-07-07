import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CrmService } from './crm.service';

// Para simplificar no MVP, estamos pegando o workspaceId por parâmetro ou query se aplicável,
// Mas se já houver um AuthGuard/JwtGuard global, o user viria do req.user.
// Assumindo que a requisição de CRM virá com /crm/:workspaceId

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post(':workspaceId')
  async createClient(@Param('workspaceId') workspaceId: string, @Body() body: any) {
    return this.crmService.createClient(workspaceId, body);
  }

  @Get(':workspaceId')
  async getClients(@Param('workspaceId') workspaceId: string) {
    return this.crmService.getClientsByWorkspace(workspaceId);
  }

  @Get(':workspaceId/:id')
  async getClient(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.crmService.getClientById(id, workspaceId);
  }

  @Put(':workspaceId/:id')
  async updateClient(
    @Param('workspaceId') workspaceId: string, 
    @Param('id') id: string, 
    @Body() body: any
  ) {
    return this.crmService.updateClient(id, workspaceId, body);
  }

  @Delete(':workspaceId/:id')
  async deleteClient(
    @Param('workspaceId') workspaceId: string, 
    @Param('id') id: string
  ) {
    return this.crmService.deleteClient(id, workspaceId);
  }
}
