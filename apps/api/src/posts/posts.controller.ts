import { Controller, Post, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async createPost(
    @Body() body: {
      workspaceId: string;
      content: string;
      mediaUrls?: string[];
      platforms: string[];
      scheduledFor?: string;
    }
  ) {
    const scheduledDate = body.scheduledFor ? new Date(body.scheduledFor) : undefined;
    return this.postsService.createPost(
      body.workspaceId,
      body.content,
      body.mediaUrls || [],
      body.platforms,
      scheduledDate
    );
  }

  @Get(':workspaceId')
  async getPosts(@Param('workspaceId') workspaceId: string) {
    return this.postsService.getWorkspacePosts(workspaceId);
  }

  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() body: {
      workspaceId: string;
      content?: string;
      scheduledFor?: string;
      status?: string;
    }
  ) {
    const scheduledDate = body.scheduledFor ? new Date(body.scheduledFor) : undefined;
    
    return this.postsService.updatePost(id, body.workspaceId, {
      content: body.content,
      scheduledFor: scheduledDate,
      status: body.status
    });
  }
}
