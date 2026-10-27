import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClubVisibility } from '@prisma/client';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { ClubsService } from './clubs.service.js';

type AuthRequest = Request & {
  user: { sub: string };
};

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  // Public discovery doesn't require sign-in.
  @Get('public')
  findPublicClubs() {
    return this.clubsService.findPublicClubs();
  }

  // All remaining routes require a valid session cookie.
  @UseGuards(SessionAuthGuard)
  @Get('mine')
  findMyClubs(@Req() req: AuthRequest) {
    return this.clubsService.findMyClubs(req.user.sub);
  }

  @UseGuards(SessionAuthGuard)
  @Post()
  createClub(
    @Req() req: AuthRequest,
    @Body()
    body: {
      name?: string;
      description?: string;
      visibility?: ClubVisibility;
    },
  ) {
    if (
      typeof body.name !== 'string' ||
      (body.description !== undefined &&
        typeof body.description !== 'string') ||
      (body.visibility !== undefined &&
        !Object.values(ClubVisibility).includes(body.visibility))
    ) {
      throw new BadRequestException('Invalid club details.');
    }

    return this.clubsService.createClub(req.user.sub, {
      name: body.name,
      description: body.description,
      visibility: body.visibility,
    });
  }

  @UseGuards(SessionAuthGuard)
  @Post(':id/join')
  joinClub(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.clubsService.joinClub(req.user.sub, id);
  }

  @UseGuards(SessionAuthGuard)
  @Get(':id/books')
  findClubBooks(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.clubsService.findClubBooks(id, req.user.sub);
  }

  @UseGuards(SessionAuthGuard)
  @Post(':id/books')
  addClubBook(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body()
    body: {
      openLibraryId?: string;
      title?: string;
      authors?: string[];
      coverUrl?: string | null;
    },
  ) {
    if (
      typeof body.openLibraryId !== 'string' ||
      typeof body.title !== 'string' ||
      (body.authors !== undefined &&
        (!Array.isArray(body.authors) ||
          !body.authors.every((author) => typeof author === 'string'))) ||
      (body.coverUrl !== undefined &&
        body.coverUrl !== null &&
        typeof body.coverUrl !== 'string')
    ) {
      throw new BadRequestException('Invalid book details.');
    }

    return this.clubsService.addClubBook(id, req.user.sub, {
      openLibraryId: body.openLibraryId,
      title: body.title,
      authors: body.authors,
      coverUrl: body.coverUrl,
    });
  }

  @UseGuards(SessionAuthGuard)
  @Get(':id/discussions')
  findDiscussions(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.clubsService.findDiscussions(id, req.user.sub);
  }

  @UseGuards(SessionAuthGuard)
  @Post(':id/discussions')
  addDiscussion(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { content?: string },
  ) {
    if (typeof body.content !== 'string') {
      throw new BadRequestException('Message content is required.');
    }

    return this.clubsService.addDiscussion(id, req.user.sub, body.content);
  }

  @UseGuards(SessionAuthGuard)
  @Delete([':id/discussions/:discussionId', 'discussions/:discussionId'])
  removeDiscussion(
    @Req() req: AuthRequest,
    @Param('discussionId') discussionId: string,
    @Param('id') id?: string,
  ) {
    return this.clubsService.removeDiscussion(req.user.sub, discussionId, id);
  }
}

