import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateClientDto, UpdateClientDto } from './crm.dto';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post(':workspaceId')
  async createClient(@Param('workspaceId') workspaceId: string, @Body() body: CreateClientDto) {
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
    @Body() body: UpdateClientDto
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
