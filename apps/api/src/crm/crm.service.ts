import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async createClient(workspaceId: string, data: any) {
    return this.prisma.client.create({
      data: {
        workspaceId,
        name: data.name,
        company: data.company,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        instagram: data.instagram,
        city: data.city,
        leadSource: data.leadSource,
        projectType: data.projectType,
        estimatedValue: data.estimatedValue,
        priority: data.priority,
        stage: data.stage || 'NOVO_INTERESSE',
        observations: data.observations,
      },
    });
  }

  async getClientsByWorkspace(workspaceId: string) {
    return this.prisma.client.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getClientById(id: string, workspaceId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, workspaceId },
    });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  async updateClient(id: string, workspaceId: string, data: any) {
    // Validate if exists
    await this.getClientById(id, workspaceId);

    return this.prisma.client.update({
      where: { id },
      data,
    });
  }

  async deleteClient(id: string, workspaceId: string) {
    // Validate if exists
    await this.getClientById(id, workspaceId);

    return this.prisma.client.delete({
      where: { id },
    });
  }
}
