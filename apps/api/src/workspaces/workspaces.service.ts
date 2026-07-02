import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async createWorkspace(userId: string, name: string) {
    return this.prisma.workspace.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          }
        }
      },
      include: { members: true }
    });
  }

  async getMyWorkspaces(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true }
    });
    return memberships.map(m => ({ ...m.workspace, role: m.role }));
  }

  async addMember(adminUserId: string, workspaceId: string, newUserEmail: string, role: string) {
    // 1. Verifica se o admin tem permissão no workspace
    const adminMember = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: adminUserId, workspaceId } }
    });

    if (!adminMember || (adminMember.role !== 'ADMIN' && adminMember.role !== 'MANAGER')) {
      throw new ForbiddenException('Apenas Administradores ou Gestores podem adicionar membros.');
    }

    // 2. Busca o usuário pelo e-mail
    const targetUser = await this.prisma.user.findUnique({ where: { email: newUserEmail } });
    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado com este e-mail.');
    }

    // 3. Adiciona ao workspace
    return this.prisma.workspaceMember.upsert({
      where: { userId_workspaceId: { userId: targetUser.id, workspaceId } },
      update: { role },
      create: { userId: targetUser.id, workspaceId, role }
    });
  }
}
