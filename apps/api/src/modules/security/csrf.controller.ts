import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { randomBytes } from 'crypto';

@Controller('csrf')
export class CsrfController {
  @Public()
  @Get('token')
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const existingToken = req.cookies?.['csrf-token'];

    if (
      existingToken &&
      typeof existingToken === 'string' &&
      existingToken.length === 64
    ) {
      return res.json({ token: existingToken });
    }

    const token = randomBytes(32).toString('hex');

    res.cookie('csrf-token', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({ token });
  }
}
