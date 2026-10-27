import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClubRole, ClubVisibility, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async createClub(
    userId: string,
    input: { name: string; description?: string; visibility?: ClubVisibility },
  ) {
    const name = input.name?.trim();

    if (!name || name.length > 80) {
      throw new BadRequestException(
        'Club name must be between 1 and 80 characters.',
      );
    }

    if (input.description !== undefined && input.description.length > 1000) {
      throw new BadRequestException(
        'Description must be 1000 characters or fewer.',
      );
    }

    const visibility = input.visibility ?? ClubVisibility.PUBLIC;

    if (!Object.values(ClubVisibility).includes(visibility)) {
      throw new BadRequestException('Invalid club visibility.');
    }

    return this.prisma.$transaction(async (txt) => {
      return txt.bookClub.create({
        data: {
          name,
          description: input.description?.trim() || null,
          visibility,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: ClubRole.OWNER,
            },
          },
        },
        include: {
          _count: { select: { members: true } },
        },
      });
    });
  }

  async findPublicClubs() {
    return this.prisma.bookClub.findMany({
      where: { visibility: ClubVisibility.PUBLIC },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, picture: true },
        },
        _count: { select: { members: true, books: true } },
      },
    });
  }

  async findMyClubs(userId: string) {
    return this.prisma.bookClub.findMany({
      where: {
        members: { some: { userId } },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { members: true, books: true } },
      },
    });
  }

  async joinClub(userId: string, clubId: string) {
    const club = await this.prisma.bookClub.findUnique({
      where: { id: clubId },
      select: { id: true, visibility: true },
    });

    if (!club) {
      throw new NotFoundException('Club not found.');
    }

    if (club.visibility !== ClubVisibility.PUBLIC) {
      throw new ForbiddenException(
        'This is a private club. You need an invitation to join.',
      );
    }

    try {
      await this.prisma.clubMember.create({
        data: {
          clubId,
          userId,
          role: ClubRole.MEMBER,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You already belong to this club.');
      }

      throw error;
    }

    return { message: 'You joined the club successfully.' };
  }

  private async requireMembership(clubId: string, userId: string) {
    const membership = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('Join this club to access its content.');
    }

    return membership;
  }

  async findClubBooks(clubId: string, userId: string) {
    await this.requireMembership(clubId, userId);

    return this.prisma.clubBook.findMany({
      where: { clubId },
      orderBy: { createdAt: 'desc' },
      include: {
        addedBy: {
          select: { id: true, name: true, picture: true },
        },
      },
    });
  }

  async addClubBook(
    clubId: string,
    userId: string,
    input: {
      openLibraryId: string;
      title: string;
      authors?: string[];
      coverUrl?: string | null;
    },
  ) {
    await this.requireMembership(clubId, userId);

    const openLibraryId = input.openLibraryId?.trim();
    const title = input.title?.trim();

    if (!openLibraryId || !title) {
      throw new BadRequestException('Book ID and title are required.');
    }

    if (
      !Array.isArray(input.authors ?? []) ||
      !(input.authors ?? []).every((author) => typeof author === 'string')
    ) {
      throw new BadRequestException('Authors must be a list of strings.');
    }

    try {
      return await this.prisma.clubBook.create({
        data: {
          clubId,
          addedById: userId,
          openLibraryId,
          title,
          authors: input.authors ?? [],
          coverUrl: input.coverUrl ?? null,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This book has already been added to the club.',
        );
      }

      throw error;
    }
  }

  async findDiscussions(clubId: string, userId: string) {
    await this.requireMembership(clubId, userId);

    return this.prisma.bookDiscussion.findMany({
      where: { clubId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, picture: true },
        },
      },
    });
  }

  async addDiscussion(clubId: string, userId: string, content: string) {
    await this.requireMembership(clubId, userId);

    const cleaned = content?.trim();

    if (!cleaned || cleaned.length > 2000) {
      throw new BadRequestException(
        'A message must contain 1–2000 characters.',
      );
    }

    return this.prisma.bookDiscussion.create({
      data: {
        clubId,
        userId,
        content: cleaned,
      },
      include: {
        user: {
          select: { id: true, name: true, picture: true },
        },
      },
    });
  }

  async removeDiscussion(
    userId: string,
    discussionId: string,
    clubId?: string,
  ) {
    const discussion = await this.prisma.bookDiscussion.findUnique({
      where: { id: discussionId },
      include: {
        club: {
          select: { ownerId: true },
        },
      },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found.');
    }

    if (clubId && discussion.clubId !== clubId) {
      throw new NotFoundException('Discussion not found in this club.');
    }

    const isAuthor = discussion.userId === userId;
    const isClubOwner = discussion.club.ownerId === userId;

    if (!isAuthor && !isClubOwner) {
      throw new ForbiddenException('You can only delete your own discussions.');
    }

    await this.prisma.bookDiscussion.delete({
      where: { id: discussionId },
    });

    return { message: 'Discussion deleted successfully.' };
  }
}

