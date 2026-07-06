import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto-js';
import { ConfigService } from '@nestjs/config';

export interface UploadedFile {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

const MAGIC_BYTES: Record<string, [number, number[]][]> = {
  'image/jpeg': [[0, [0xff, 0xd8, 0xff]]],
  'image/png': [[0, [0x89, 0x50, 0x4e, 0x47]]],
  'image/webp': [
    [0, [0x52, 0x49, 0x46, 0x46]],
    [8, [0x57, 0x45, 0x42, 0x50]],
  ],
  'video/mp4': [[4, [0x66, 0x74, 0x79, 0x70]]],
  'video/webm': [[0, [0x1a, 0x45, 0xdf, 0xa3]]],
  'application/pdf': [[0, [0x25, 0x50, 0x44, 0x46]]],
};

@Injectable()
export class UploadService {
  private readonly logger = new Logger('UploadService');
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  private readonly encryptionKey: string;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('FILE_ENCRYPTION_KEY');
    if (!key || key.length < 32) {
      throw new Error('FILE_ENCRYPTION_KEY is required (min 32 chars). Generate with: openssl rand -base64 24');
    }
    this.encryptionKey = key;
    const subdirs = ['videos', 'thumbnails', 'documents', 'images', 'files'];
    for (const dir of subdirs) {
      const full = path.join(this.uploadDir, dir);
      if (!fs.existsSync(full)) {
        fs.mkdirSync(full, { recursive: true });
      }
    }
  }

  private encryptFile(buffer: Buffer): Buffer {
    const wordArray = crypto.lib.WordArray.create(buffer);
    const encrypted = crypto.AES.encrypt(
      wordArray,
      this.encryptionKey,
    ).toString();
    return Buffer.from(encrypted, 'utf8');
  }

  private decryptFile(buffer: Buffer): Buffer {
    const encrypted = buffer.toString('utf8');
    const decrypted = crypto.AES.decrypt(encrypted, this.encryptionKey);
    return Buffer.from(decrypted.toString(crypto.enc.Utf8), 'utf8');
  }

  getUploadDir(): string {
    return this.uploadDir;
  }

  private validateMagicBytes(file: Express.Multer.File): boolean {
    const patterns = MAGIC_BYTES[file.mimetype];
    if (!patterns) return true;
    const buf = file.buffer;
    return patterns.every(([offset, bytes]) =>
      bytes.every((byte, i) => buf[offset + i] === byte),
    );
  }

  private detectMimeFromMagic(buffer: Buffer): string | null {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
      return 'image/jpeg';
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    )
      return 'image/png';
    if (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    )
      return 'application/pdf';
    if (
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3
    )
      return 'video/webm';
    if (
      buffer[4] === 0x66 &&
      buffer[5] === 0x74 &&
      buffer[6] === 0x79 &&
      buffer[7] === 0x70
    )
      return 'video/mp4';
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46
    )
      return 'image/webp';
    return null;
  }

  saveFile(
    file: Express.Multer.File,
    subdir: string = 'files',
    userId?: number,
  ): UploadedFile {
    this.logger.log(
      JSON.stringify({
        type: 'upload-start',
        userId,
        originalName: file.originalname,
        declaredMime: file.mimetype,
        size: file.size,
        subdir,
      }),
    );

    const declaredMime = file.mimetype;
    const detectedMime = this.detectMimeFromMagic(file.buffer);

    if (!detectedMime) {
      this.logger.warn(
        JSON.stringify({
          type: 'upload-reject-magic',
          userId,
          originalName: file.originalname,
          declaredMime,
          reason: 'unknown_magic_bytes',
        }),
      );
      throw new HttpException('فرمت فایل شناسایی نشد', HttpStatus.BAD_REQUEST);
    }

    if (declaredMime !== detectedMime) {
      this.logger.warn(
        JSON.stringify({
          type: 'upload-reject-mime-mismatch',
          userId,
          originalName: file.originalname,
          declaredMime,
          detectedMime,
        }),
      );
      throw new HttpException(
        'نوع فایل با محتوای واقعی مطابقت ندارد',
        HttpStatus.BAD_REQUEST,
      );
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const destDir = path.join(this.uploadDir, subdir);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const destPath = path.join(destDir, safeName);
    const encryptedBuffer = this.encryptFile(file.buffer);
    fs.writeFileSync(destPath, encryptedBuffer);

    this.logger.log(
      JSON.stringify({
        type: 'upload-complete',
        userId,
        originalName: file.originalname,
        mime: detectedMime,
        size: encryptedBuffer.length,
        url: `/uploads/${subdir}/${safeName}`,
      }),
    );

    return {
      url: `/uploads/${subdir}/${safeName}`,
      originalName: file.originalname,
      mimeType: detectedMime,
      size: encryptedBuffer.length,
    };
  }

  deleteFile(urlPath: string): void {
    // Security: Prevent path traversal
    if (urlPath.includes('..') || urlPath.startsWith('/')) {
      throw new Error('Invalid file path');
    }

    const fullPath = path.join(process.cwd(), 'uploads', urlPath);
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Security: Ensure resolved path is within uploads directory
    if (!fullPath.startsWith(uploadDir)) {
      throw new Error('Path traversal detected');
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      this.logger.log(JSON.stringify({ type: 'file-delete', path: urlPath }));
    }
  }
}
