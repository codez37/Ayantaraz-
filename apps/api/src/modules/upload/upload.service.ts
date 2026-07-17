import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface StoredUpload {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedBy: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadRoot = path.join(process.cwd(), 'uploads');

  async saveFile(
    file: Express.Multer.File,
    subdir: string,
    userId: number,
  ): Promise<StoredUpload> {
    if (!file.buffer) throw new BadRequestException('فایل معتبر نیست');
    const safeSubdir = path.basename(subdir);
    const targetDir = path.join(this.uploadRoot, safeSubdir);
    await fs.promises.mkdir(targetDir, { recursive: true });

    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
    const targetPath = path.join(targetDir, filename);
    await fs.promises.writeFile(targetPath, file.buffer, { flag: 'wx' });

    this.logger.log(`Stored upload ${filename} for user ${userId}`);
    return {
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${safeSubdir}/${filename}`,
      uploadedBy: userId,
    };
  }

  deleteFile(urlPath: string): void {
    const normalizedPath = path.normalize(urlPath).replace(/^[/\\]+/, '');
    const relativePath = normalizedPath.startsWith('uploads/')
      ? normalizedPath.slice('uploads/'.length)
      : normalizedPath;
    const targetPath = path.resolve(this.uploadRoot, relativePath);
    if (!targetPath.startsWith(this.uploadRoot + path.sep)) {
      throw new BadRequestException('مسیر فایل نامعتبر است');
    }
    if (!fs.existsSync(targetPath))
      throw new NotFoundException('فایل یافت نشد');
    fs.unlinkSync(targetPath);
  }
}
