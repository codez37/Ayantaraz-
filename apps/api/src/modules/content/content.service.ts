import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { ContentStatus, Prisma } from '@prisma/client';

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['review', 'published'],
  review: ['draft', 'published'],
  published: ['draft', 'archived'],
  archived: ['draft'],
};

@Injectable()
export class ContentService {
  private readonly logger = new Logger('ContentService');

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  private toSlug(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9آ-ی\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 200);
  }

  private canTransition(from: string, to: string, role: string): boolean {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) return false;
    if (to === 'published' && from === 'draft' && role !== 'admin')
      return false;
    if (to === 'published' && from === 'review')
      return ['admin', 'content_manager'].includes(role);
    if (to === 'archived' && role !== 'admin') return false;
    if (to === 'draft' && from === 'published' && role !== 'admin')
      return false;
    return true;
  }

  private isLocalFile(url: string): boolean {
    return url.startsWith('/uploads/');
  }

  private validateFileBinding(data: {
    mediaUrl?: string;
    thumbnailUrl?: string;
  }): void {
    for (const [field, url] of Object.entries(data)) {
      if (url && this.isLocalFile(url)) {
        const fullPath = path.join(process.cwd(), url);
        if (!fs.existsSync(fullPath)) {
          throw new HttpException(
            `فایل ${field} یافت نشد: ${url}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
  }

  private cleanupFiles(content: {
    mediaUrl?: string;
    thumbnailUrl?: string;
  }): void {
    for (const url of [content.mediaUrl, content.thumbnailUrl]) {
      if (url && this.isLocalFile(url)) {
        try {
          this.uploadService.deleteFile(url);
        } catch {
          this.logger.warn(
            JSON.stringify({
              type: 'file-cleanup-failed',
              url,
            }),
          );
        }
      }
    }
  }

  async list(params: {
    type?: string;
    status?: string;
    visibility?: string;
    categoryId?: number;
    search?: string;
    tags?: string;
    page?: number;
    limit?: number;
    userId?: number;
    userRole?: string;
  }) {
    const {
      type,
      status,
      visibility,
      categoryId,
      search,
      tags,
      page = 1,
      limit = 20,
      userId,
      userRole,
    } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ContentWhereInput = {};

    if (type) where.contentType = type as import('@prisma/client').ContentType;
    if (status) where.status = status as import('@prisma/client').ContentStatus;
    if (visibility)
      where.visibility =
        visibility as import('@prisma/client').ContentVisibility;
    if (categoryId) where.categoryId = categoryId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      const tagFilters: Prisma.ContentWhereInput[] = tagList.map((tag) => ({
        tags: { contains: tag, mode: 'insensitive' },
      }));
      if (where.AND) {
        (where.AND as Prisma.ContentWhereInput[]).push(...tagFilters);
      } else {
        where.AND = tagFilters;
      }
    }

    if (!userRole || userRole === 'user') {
      const visibilityFilter: Prisma.ContentWhereInput[] = [
        { visibility: 'public' },
      ];
      if (userId) {
        visibilityFilter.push({
          visibility: 'authenticated',
          authorId: userId,
        });
      }
      if (where.AND) {
        (where.AND as Prisma.ContentWhereInput[]).push({
          OR: visibilityFilter,
        });
      } else if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: visibilityFilter }];
        delete where.OR;
      } else {
        where.OR = visibilityFilter;
      }
      if (!status) where.status = 'published';
    }

    const [data, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          reviewer: { select: { id: true, firstName: true, lastName: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBySlug(slug: string, userId?: number, userRole?: string) {
    const content = await this.prisma.content.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
        category: true,
      },
    });

    if (!content)
      throw new HttpException('محتوا یافت نشد', HttpStatus.NOT_FOUND);

    if (
      content.status !== 'published' &&
      !['admin', 'content_manager'].includes(userRole || '')
    ) {
      throw new HttpException('محتوا یافت نشد', HttpStatus.NOT_FOUND);
    }

    if (
      content.visibility === 'admin_only' &&
      !['admin', 'content_manager'].includes(userRole || '')
    ) {
      throw new HttpException('محتوا یافت نشد', HttpStatus.NOT_FOUND);
    }

    if (content.visibility === 'authenticated' && !userId) {
      throw new HttpException(
        'برای مشاهده این مطلب وارد شوید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return content;
  }

  async create(
    data: {
      contentType: string;
      title: string;
      slug?: string;
      summary?: string;
      body?: string;
      metaDescription?: string;
      tags?: string;
      mediaUrl?: string;
      thumbnailUrl?: string;
      duration?: number;
      fileSize?: number;
      pageCount?: number;
      categoryId?: number;
      visibility?: string;
    },
    authorId: number,
  ) {
    this.validateFileBinding(data);

    const content = await this.prisma.content.create({
      data: {
        contentType: data.contentType as import('@prisma/client').ContentType,
        title: data.title,
        slug: data.slug || this.toSlug(data.title),
        summary: data.summary || '',
        body: data.body || '',
        metaDescription: data.metaDescription || '',
        tags: data.tags || '',
        mediaUrl: data.mediaUrl || '',
        thumbnailUrl: data.thumbnailUrl || '',
        duration: data.duration || 0,
        fileSize: data.fileSize || 0,
        pageCount: data.pageCount || 0,
        categoryId: data.categoryId ?? null,
        visibility:
          (data.visibility as import('@prisma/client').ContentVisibility) ||
          'public',
        status: 'draft',
        authorId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: authorId,
        action: 'content_create',
        entityType: 'content',
        entityId: content.id,
        newValue: { title: content.title, contentType: content.contentType },
      },
    });

    this.logger.log(
      JSON.stringify({
        type: 'content-created',
        contentId: content.id,
        contentType: content.contentType,
        hasMedia: !!content.mediaUrl,
        hasThumbnail: !!content.thumbnailUrl,
      }),
    );

    return content;
  }

  async update(
    id: number,
    data: Partial<{
      title: string;
      slug: string;
      summary: string;
      body: string;
      metaDescription: string;
      tags: string;
      mediaUrl: string;
      thumbnailUrl: string;
      duration: number;
      categoryId: number | null;
      visibility: string;
    }>,
    userId: number,
    userRole: string,
  ) {
    const existing = await this.prisma.content.findUnique({ where: { id } });
    if (!existing)
      throw new HttpException('محتوا یافت نشد', HttpStatus.NOT_FOUND);

    if (
      existing.status === 'published' &&
      !['admin', 'content_manager'].includes(userRole)
    ) {
      throw new HttpException(
        'محتوای منتشرشده فقط توسط مدیر قابل ویرایش است',
        HttpStatus.FORBIDDEN,
      );
    }

    this.validateFileBinding(data);

    const updateData: Prisma.ContentUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.metaDescription !== undefined)
      updateData.metaDescription = data.metaDescription;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.mediaUrl !== undefined) updateData.mediaUrl = data.mediaUrl;
    if (data.thumbnailUrl !== undefined)
      updateData.thumbnailUrl = data.thumbnailUrl;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.categoryId !== undefined && data.categoryId !== null)
      updateData.category = { connect: { id: data.categoryId } };
    if (data.visibility !== undefined)
      updateData.visibility =
        data.visibility as import('@prisma/client').ContentVisibility;

    const content = await this.prisma.content.update({
      where: { id },
      data: updateData,
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'content_update',
        entityType: 'content',
        entityId: id,
        oldValue: { title: existing.title, status: existing.status },
        newValue: { title: content.title },
      },
    });

    return content;
  }

  async updateStatus(
    id: number,
    status: ContentStatus,
    userId: number,
    userRole: string,
  ) {
    const existing = await this.prisma.content.findUnique({ where: { id } });
    if (!existing)
      throw new HttpException('محتوا یافت نشد', HttpStatus.NOT_FOUND);

    if (!this.canTransition(existing.status, status, userRole)) {
      throw new HttpException(
        'این تغییر وضعیت مجاز نیست',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateData: Prisma.ContentUpdateInput = { status };

    if (status === 'published') {
      updateData.publishedAt = new Date();
      updateData.reviewer = { connect: { id: userId } };
      updateData.reviewedAt = new Date();
    }
    if (status === 'archived') updateData.archivedAt = new Date();
    if (
      status === 'draft' &&
      (existing.status === 'published' || existing.status === 'archived')
    ) {
      updateData.publishedAt = null;
    }

    const content = await this.prisma.content.update({
      where: { id },
      data: updateData,
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: `content_status_${status}`,
        entityType: 'content',
        entityId: id,
        oldValue: { status: existing.status },
        newValue: { status, publishedAt: updateData.publishedAt },
      },
    });

    return content;
  }

  async archive(id: number, userId: number, userRole: string) {
    const existing = await this.prisma.content.findUnique({ where: { id } });
    if (!existing)
      throw new HttpException('محتوا یافت نشد', HttpStatus.NOT_FOUND);

    const result = await this.updateStatus(id, 'archived', userId, userRole);

    this.cleanupFiles(existing);

    this.logger.log(
      JSON.stringify({
        type: 'content-archived',
        contentId: id,
        filesCleaned: !!(existing.mediaUrl || existing.thumbnailUrl),
      }),
    );

    return result;
  }
}
