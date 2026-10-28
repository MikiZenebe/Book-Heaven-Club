import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { Request, Response } from 'express';

const COOKIE_NAME = 'booknest_session';

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  };
}

function extractToken(request: Request): string | undefined {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return request.cookies?.[COOKIE_NAME];
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleSignIn(
    @Body() body: { idToken?: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    if (typeof body.idToken !== 'string' || !body.idToken.trim()) {
      throw new BadRequestException('Google ID token is required.');
    }

    const result = await this.authService.signInWithGoogle(body.idToken);

    response.cookie(COOKIE_NAME, result.accessToken, {
      ...getCookieOptions(),
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Get('me')
  async getCurrentUser(@Req() request: Request) {
    const accessToken = extractToken(request);
    if (!accessToken) {
      throw new UnauthorizedException('You are not signed in.');
    }

    const user = await this.authService.getCurrentUser(accessToken);

    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(COOKIE_NAME, getCookieOptions());

    return { message: 'Signed out successfully.' };
  }
}
