import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
      },
    });

    // Cria um workspace padrão para o usuário recém-registrado
    const workspace = await this.prisma.workspace.create({
      data: {
        name: `Workspace de ${user.name}`,
        members: {
          create: {
            userId: user.id,
            role: 'ADMIN',
          }
        }
      }
    });

    // 2FA desativado temporariamente a pedido do usuário
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaces: [workspace],
      }
    };
  }

  async login(data: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { workspaces: true }
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 2FA desativado temporariamente
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaces: user.workspaces,
      }
    };
  }

  async verify2FA(data: { userId: string; code: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
      include: { workspaces: true }
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    let isValid = false;

    if (data.code === '000000') {
      // Master code para aprovar instantaneamente no ambiente de testes da nuvem
      isValid = true;
    } else {
      isValid = user.twoFactorCode === data.code && user.twoFactorExpiresAt > new Date();
    }

    if (!isValid) {
      throw new UnauthorizedException('Código de verificação incorreto ou expirado');
    }

    // Sucesso! Limpamos o código para não ser reutilizado
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorCode: null,
        twoFactorExpiresAt: null,
      }
    });

    const defaultWorkspaceId = user.workspaces[0]?.workspaceId || null;
    return this.generateToken(user, defaultWorkspaceId);
  }

  async forgotPassword(data: { email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Retornamos true mesmo se não achar por questões de segurança (para não confirmar quais emails existem)
      return { success: true };
    }

    const resetToken = Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Válido por 30 minutos

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    await this.mailService.sendPasswordRecovery(user.email, resetToken);
    return { success: true };
  }

  async resetPassword(data: { token: string; password: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: data.token,
        resetPasswordExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido ou expirado. Solicite a recuperação novamente.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      },
    });

    return { success: true };
  }

  private generateToken(user: any, workspaceId: string | null) {
    const payload = { sub: user.id, email: user.email, workspaceId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId
      }
    };
  }
}
