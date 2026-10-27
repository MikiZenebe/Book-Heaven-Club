import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClubsService } from './clubs.service.js';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('ClubsService - removeDiscussion', () => {
  let service: ClubsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      bookDiscussion: {
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new ClubsService(prismaMock as PrismaService);
  });

  it('should throw NotFoundException if discussion does not exist', async () => {
    prismaMock.bookDiscussion.findUnique.mockResolvedValue(null);

    await expect(
      service.removeDiscussion('user-1', 'discussion-1', 'club-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if clubId does not match discussion clubId', async () => {
    prismaMock.bookDiscussion.findUnique.mockResolvedValue({
      id: 'discussion-1',
      clubId: 'club-2',
      userId: 'user-1',
      club: { ownerId: 'user-2' },
    });

    await expect(
      service.removeDiscussion('user-1', 'discussion-1', 'club-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not author and not club owner', async () => {
    prismaMock.bookDiscussion.findUnique.mockResolvedValue({
      id: 'discussion-1',
      clubId: 'club-1',
      userId: 'author-user',
      club: { ownerId: 'club-owner' },
    });

    await expect(
      service.removeDiscussion('other-user', 'discussion-1', 'club-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow discussion author to delete discussion', async () => {
    prismaMock.bookDiscussion.findUnique.mockResolvedValue({
      id: 'discussion-1',
      clubId: 'club-1',
      userId: 'author-user',
      club: { ownerId: 'club-owner' },
    });
    prismaMock.bookDiscussion.delete.mockResolvedValue({});

    const result = await service.removeDiscussion(
      'author-user',
      'discussion-1',
      'club-1',
    );

    expect(prismaMock.bookDiscussion.delete).toHaveBeenCalledWith({
      where: { id: 'discussion-1' },
    });
    expect(result).toEqual({ message: 'Discussion deleted successfully.' });
  });

  it('should allow club owner to delete discussion even if not author', async () => {
    prismaMock.bookDiscussion.findUnique.mockResolvedValue({
      id: 'discussion-1',
      clubId: 'club-1',
      userId: 'author-user',
      club: { ownerId: 'club-owner' },
    });
    prismaMock.bookDiscussion.delete.mockResolvedValue({});

    const result = await service.removeDiscussion(
      'club-owner',
      'discussion-1',
      'club-1',
    );

    expect(prismaMock.bookDiscussion.delete).toHaveBeenCalledWith({
      where: { id: 'discussion-1' },
    });
    expect(result).toEqual({ message: 'Discussion deleted successfully.' });
  });
});
