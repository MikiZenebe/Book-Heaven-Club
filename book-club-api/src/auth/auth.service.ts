import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async signInWithGoogle(idToken: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not configured.');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();

      if (!payload?.sub || !payload.email) {
        throw new UnauthorizedException(
          'Google account information is incomplete.',
        );
      }

      if (payload.email_verified !== true) {
        throw new UnauthorizedException('Your Google email must be verified.');
      }

      // It checks whether a record exists for that Google account. If it exists, the profile is updated; otherwise, a new user is created.
      const user = await this.prisma.user.upsert({
        where: {
          googleId: payload.sub,
        },
        update: {
          email: payload.email,
          name: payload.name ?? '',
          picture: payload.picture ?? null,
        },
        create: {
          email: payload.email,
          name: payload.name ?? '',
          picture: payload.picture ?? null,
          googleId: payload.sub,
        },
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          createdAt: true,
        },
      });

      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
      });

      return {
        message: 'Google sign-in verified.',
        user,
        accessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Unable to verify your Google sign-in.');
    }
  }

  async getCurrentUser(accessToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        accessToken,
      );

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          googleId: true,
          email: true,
          name: true,
          picture: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User no longer exists.');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Session is invalid or expired.');
    }
  }
}
