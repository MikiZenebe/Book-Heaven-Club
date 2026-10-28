import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { sub: string };
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7).trim()
        : undefined;

    const token = bearerToken || request.cookies?.booknest_session;

    if (!token) {
      throw new UnauthorizedException('Please sign in first.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
      }>(token);

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid session.');
      }

      request.user = { sub: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException('Your session is invalid or expired.');
    }
  }
}
