import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Upload } from '@prisma/client';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly maxFileSize = 10 * 1024 * 1024;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json',
  ];

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory at ${this.uploadDir}`);
    }
  }

  async uploadFile(
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
    userId: string,
    options: {
      isPublic?: boolean;
      description?: string;
      tags?: string[];
    } = {},
  ): Promise<Upload> {
    this.logger.log(`Uploading file: ${file.originalname} by user ${userId}`);
    this.validateFile(file);
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString('hex');
    const filename = `${basename}_${timestamp}_${randomString}${ext}`;
    const filePath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    this.logger.debug(`File saved to ${filePath}`);
    const upload = await this.prisma.upload.create({
      data: {
        filename: file.originalname,
        storedFilename: filename,
        path: filePath,
        mimeType: file.mimetype,
        size: file.size,
        userId,
        isPublic: options.isPublic !== undefined ? options.isPublic : true,
        description: options.description || '',
        tags: options.tags || [],
        checksum: this.calculateChecksum(file.buffer),
      },
    });
    this.logger.log(`File uploaded successfully: ${upload.id}`);
    return upload;
  }

  async findById(id: string): Promise<Upload | null> {
    this.logger.debug(`Finding upload by ID: ${id}`);
    return this.prisma.upload.findUnique({
      where: { id },
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
    });
  }

  async list(
    page: number = 1,
    limit: number = 10,
    filters: {
      userId?: string;
      isPublic?: boolean;
      search?: string;
    } = {},
  ): Promise<{ uploads: Upload[]; total: number; page: number; limit: number }> {
    this.logger.debug(`Listing uploads - page: ${page}, limit: ${limit}`);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;
    if (filters.search) {
      where.OR = [
        { filename: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const [uploads, total] = await Promise.all([
      this.prisma.upload.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.upload.count({ where }),
    ]);
    return {
      uploads: uploads as any[],
      total,
      page,
      limit,
    };
  }

  async delete(id: string): Promise<Upload> {
    this.logger.log(`Deleting upload ${id}`);
    const upload = await this.findById(id);
    if (!upload) {
      this.logger.error(`Upload ${id} not found`);
      throw new Error('Upload not found');
    }
    try {
      if (fs.existsSync(upload.path)) {
        fs.unlinkSync(upload.path);
        this.logger.debug(`File deleted from filesystem: ${upload.path}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file from filesystem: ${error}`);
    }
    return this.prisma.upload.delete({
      where: { id },
    });
  }

  async getFileStream(id: string): Promise<{ stream: fs.ReadStream; upload: Upload }> {
    this.logger.debug(`Getting file stream for upload ${id}`);
    const upload = await this.findById(id);
    if (!upload) {
      this.logger.error(`Upload ${id} not found`);
      throw new Error('Upload not found');
    }
    if (!fs.existsSync(upload.path)) {
      this.logger.error(`File not found on filesystem: ${upload.path}`);
      throw new Error('File not found');
    }
    const stream = fs.createReadStream(upload.path);
    return { stream, upload };
  }

  async getFileBuffer(id: string): Promise<{ buffer: Buffer; upload: Upload }> {
    this.logger.debug(`Getting file buffer for upload ${id}`);
    const upload = await this.findById(id);
    if (!upload) {
      this.logger.error(`Upload ${id} not found`);
      throw new Error('Upload not found');
    }
    if (!fs.existsSync(upload.path)) {
      this.logger.error(`File not found on filesystem: ${upload.path}`);
      throw new Error('File not found');
    }
    const buffer = fs.readFileSync(upload.path);
    return { buffer, upload };
  }

  async updateMetadata(
    id: string,
    data: {
      description?: string;
      tags?: string[];
      isPublic?: boolean;
    },
  ): Promise<Upload> {
    this.logger.log(`Updating metadata for upload ${id}`);
    const upload = await this.findById(id);
    if (!upload) {
      this.logger.error(`Upload ${id} not found`);
      throw new Error('Upload not found');
    }
    return this.prisma.upload.update({
      where: { id },
      data,
    });
  }

  async getByUser(userId: string, limit: number = 10): Promise<Upload[]> {
    this.logger.debug(`Getting uploads by user ${userId} - limit: ${limit}`);
    return this.prisma.upload.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
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
    });
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    publicFiles: number;
    privateFiles: number;
  }> {
    this.logger.debug('Getting storage statistics');
    const [totalFiles, totalSize, publicFiles, privateFiles] = await Promise.all([
      this.prisma.upload.count(),
      this.prisma.upload.aggregate({
        _sum: { size: true },
      }),
      this.prisma.upload.count({ where: { isPublic: true } }),
      this.prisma.upload.count({ where: { isPublic: false } }),
    ]);
    return {
      totalFiles,
      totalSize: (totalSize as any)?._sum?.size || 0,
      publicFiles,
      privateFiles,
    };
  }

  async cleanupOldFiles(days: number = 30): Promise<{ deletedCount: number; deletedSize: number }> {
    this.logger.log(`Cleaning up files older than ${days} days`);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const oldUploads = await this.prisma.upload.findMany({
      where: { createdAt: { lt: cutoffDate } },
    });
    let deletedCount = 0;
    let deletedSize = 0;
    for (const upload of oldUploads) {
      try {
        if (fs.existsSync(upload.path)) {
          const stats = fs.statSync(upload.path);
          fs.unlinkSync(upload.path);
          deletedSize += stats.size;
          deletedCount++;
          this.logger.debug(`Deleted file: ${upload.path}`);
        }
      } catch (error) {
        this.logger.error(`Failed to delete file ${upload.path}: ${error}`);
      }
    }
    await this.prisma.upload.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });
    this.logger.log(`Cleanup complete: ${deletedCount} files, ${deletedSize} bytes deleted`);
    return { deletedCount, deletedSize };
  }

  private validateFile(file: { originalname: string; mimetype: string; size: number }): void {
    if (file.size > this.maxFileSize) {
      this.logger.warn(`File too large: ${file.originalname} (${file.size} bytes)`);
      throw new BadRequestException(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`Invalid mime type: ${file.mimetype} for file ${file.originalname}`);
      throw new BadRequestException(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }
    if (!file.originalname || file.originalname.length > 255) {
      this.logger.warn(`Invalid filename: ${file.originalname}`);
      throw new BadRequestException('Invalid filename');
    }
  }

  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}