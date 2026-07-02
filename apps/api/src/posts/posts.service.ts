import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsProcessor } from './posts.processor';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private processor: PostsProcessor
  ) {}

  async createPost(
    workspaceId: string, 
    content: string, 
    mediaUrls: string[], 
    platforms: string[],
    scheduledFor?: Date
  ) {
    if (!platforms || platforms.length === 0) {
      throw new BadRequestException('Selecione pelo menos uma plataforma para publicar.');
    }

    const post = await this.prisma.post.create({
      data: {
        workspaceId,
        content,
        mediaUrls: JSON.stringify(mediaUrls),
        platforms: JSON.stringify(platforms),
        scheduledFor,
        status: scheduledFor ? 'DRAFT' : 'QUEUED',
      }
    });

    if (!scheduledFor) {
      for (const platform of platforms) {
        this.processor.processJob({
          postId: post.id,
          workspaceId,
          platform,
          content,
          mediaUrls,
        }).catch(err => console.error(err));
      }
    }

    return post;
  }

  async getWorkspacePosts(workspaceId: string) {
    return this.prisma.post.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updatePost(
    postId: string,
    workspaceId: string,
    updateData: {
      content?: string;
      scheduledFor?: Date;
      status?: string;
    }
  ) {
    // Validar se o post pertence ao workspace
    const existing = await this.prisma.post.findFirst({
      where: { id: postId, workspaceId }
    });
    if (!existing) {
      throw new BadRequestException('Post não encontrado ou não pertence a este workspace.');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: updateData,
    });
  }
}
