import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Content, ContentStatus, ContentType } from '@prisma/client';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: {
      title: string;
      description?: string;
      type: ContentType;
      content?: string;
      metadata?: any;
      authorId: string;
      categoryId?: string;
      tags?: string[];
      isPublic?: boolean;
    },
  ): Promise<Content> {
    this.logger.log(`Creating new content: ${data.title}`);
    return this.prisma.content.create({
      data: {
        title: data.title,
        slug: this.generateSlug(data.title),
        description: data.description || '',
        type: data.type,
        content: data.content || '',
        metadata: data.metadata || {},
        authorId: data.authorId,
        categoryId: data.categoryId || null,
        tags: data.tags || [],
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        status: ContentStatus.DRAFT,
        viewCount: 0,
        likeCount: 0,
      },
    });
  }

  async findById(id: string): Promise<Content | null> {
    this.logger.debug(`Finding content by ID: ${id}`);
    return this.prisma.content.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        category: true,
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Content | null> {
    this.logger.debug(`Finding content by slug: ${slug}`);
    return this.prisma.content.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async list(
    page: number = 1,
    limit: number = 10,
    filters: {
      type?: ContentType;
      status?: ContentStatus;
      categoryId?: string;
      authorId?: string;
      isPublic?: boolean;
      tags?: string[];
      search?: string;
    } = {},
  ): Promise<{ contents: Content[]; total: number; page: number; limit: number }> {
    this.logger.debug(`Listing content - page: ${page}, limit: ${limit}`);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;
    if (filters.tags && filters.tags.length > 0) where.tags = { hasEvery: filters.tags };
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              phone: true,
              firstName: true,
              lastName: true,
            },
          },
          category: true,
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
      }),
      this.prisma.content.count({ where }),
    ]);
    return {
      contents: contents as any[],
      total,
      page,
      limit,
    };
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      content?: string;
      metadata?: any;
      categoryId?: string;
      tags?: string[];
      isPublic?: boolean;
      status?: ContentStatus;
    },
  ): Promise<Content> {
    this.logger.log(`Updating content ${id}`);
    const content = await this.findById(id);
    if (!content) {
      this.logger.error(`Content ${id} not found`);
      throw new NotFoundException('Content not found');
    }
    const updateData: any = { ...data };
    if (data.title) {
      updateData.slug = this.generateSlug(data.title);
    }
    return this.prisma.content.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<Content> {
    this.logger.log(`Deleting content ${id}`);
    const content = await this.findById(id);
    if (!content) {
      this.logger.error(`Content ${id} not found`);
      throw new NotFoundException('Content not found');
    }
    return this.prisma.content.delete({
      where: { id },
    });
  }

  async incrementViewCount(id: string): Promise<Content> {
    this.logger.debug(`Incrementing view count for content ${id}`);
    return this.prisma.content.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  async likeContent(userId: string, contentId: string): Promise<Content> {
    this.logger.debug(`User ${userId} liking content ${contentId}`);
    const existingLike = await this.prisma.like.findFirst({
      where: { userId, contentId },
    });
    if (existingLike) {
      this.logger.debug('User already liked this content');
      throw new Error('Already liked');
    }
    await this.prisma.like.create({
      data: { userId, contentId },
    });
    return this.prisma.content.update({
      where: { id: contentId },
      data: { likeCount: { increment: 1 } },
    });
  }

  async unlikeContent(userId: string, contentId: string): Promise<Content> {
    this.logger.debug(`User ${userId} unliking content ${contentId}`);
    const existingLike = await this.prisma.like.findFirst({
      where: { userId, contentId },
    });
    if (!existingLike) {
      this.logger.debug('User did not like this content');
      throw new Error('Not liked');
    }
    await this.prisma.like.delete({
      where: { id: existingLike.id },
    });
    return this.prisma.content.update({
      where: { id: contentId },
      data: { likeCount: { decrement: 1 } },
    });
  }

  async getTrending(limit: number = 10): Promise<Content[]> {
    this.logger.debug(`Getting trending content - limit: ${limit}`);
    return this.prisma.content.findMany({
      where: { isPublic: true, status: ContentStatus.PUBLISHED },
      take: limit,
      orderBy: [
        { viewCount: 'desc' },
        { likeCount: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: {
          select: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            views: true,
          },
        },
      },
    });
  }

  async getLatest(limit: number = 10): Promise<Content[]> {
    this.logger.debug(`Getting latest content - limit: ${limit}`);
    return this.prisma.content.findMany({
      where: { isPublic: true, status: ContentStatus.PUBLISHED },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
      },
    });
  }

  async getByAuthor(authorId: string, limit: number = 10): Promise<Content[]> {
    this.logger.debug(`Getting content by author ${authorId} - limit: ${limit}`);
    return this.prisma.content.findMany({
      where: { authorId, isPublic: true, status: ContentStatus.PUBLISHED },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        _count: {
          select: {
            likes: true,
            views: true,
          },
        },
      },
    });
  }

  async publish(id: string): Promise<Content> {
    this.logger.log(`Publishing content ${id}`);
    const content = await this.findById(id);
    if (!content) {
      this.logger.error(`Content ${id} not found`);
      throw new NotFoundException('Content not found');
    }
    return this.prisma.content.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}