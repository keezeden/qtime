import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_SECRET,
} from '../auth.constants';
import type { AccessTokenPayload } from '../types/auth-user';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        { secret: ACCESS_TOKEN_SECRET },
      );
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true, nametag: true },
      });

      if (!user) {
        throw new UnauthorizedException('Authentication is invalid');
      }

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Authentication is invalid');
    }
  }

  private extractToken(request: Request): string | undefined {
    const headerToken = request.headers.authorization?.split(' ')[1];
    return headerToken ?? request.cookies?.[ACCESS_TOKEN_COOKIE];
  }
}
