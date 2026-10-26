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
import type { Request, response, Response } from 'express';

const COOKIE_NAME = 'booknest_session';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

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

    response.cookie('booknest_session', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      user: result.user,
    };
  }

  @Get('me')
  async getCurrentUser(@Req() request: Request) {
    const accessToken = request.cookies?.[COOKIE_NAME];
    if (!accessToken) {
      throw new UnauthorizedException('You are not signed in.');
    }

    const user = await this.authService.getCurrentUser(accessToken);

    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(COOKIE_NAME, cookieOptions);

    return { message: 'Signed out successfully.' };
  }
}
