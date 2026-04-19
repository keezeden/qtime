import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import type { AccessTokenPayload, AuthUser } from './types/auth-user';

type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
};

const safeUserSelect = {
  id: true,
  username: true,
  nametag: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthSession> {
    const username = signupDto.username.trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    const passwordHash = await argon2.hash(signupDto.password);
    const user = await this.prisma.user.create({
      data: {
        username,
        nametag: signupDto.nametag?.trim() || null,
        passwordHash,
      },
      select: safeUserSelect,
    });

    return this.createSession(user);
  }

  async login(loginDto: LoginDto): Promise<AuthSession> {
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username.trim() },
      select: {
        id: true,
        username: true,
        nametag: true,
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      loginDto.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.createSession(this.toAuthUser(user));
  }

  async refresh(
    sessionId: string | undefined,
    refreshToken: string | undefined,
  ): Promise<AuthSession> {
    if (!sessionId || !refreshToken) {
      throw new UnauthorizedException('Refresh session is required');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('Refresh session is invalid');
    }

    const tokenMatches = await argon2.verify(
      session.refreshTokenHash,
      refreshToken,
    );

    if (!tokenMatches) {
      await this.revokeSession(sessionId);
      throw new UnauthorizedException('Refresh session is invalid');
    }

    const nextRefreshToken = this.generateRefreshToken();
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: await argon2.hash(nextRefreshToken),
        expiresAt: this.refreshExpiry(),
      },
    });

    return {
      user: this.toAuthUser(session.user),
      accessToken: await this.createAccessToken(this.toAuthUser(session.user)),
      refreshToken: nextRefreshToken,
      sessionId,
    };
  }

  async me(userId: number): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return user;
  }

  async revokeSession(sessionId: string | undefined): Promise<void> {
    if (!sessionId) {
      return;
    }

    await this.prisma.session
      .update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }

  private async createSession(user: AuthUser): Promise<AuthSession> {
    const refreshToken = this.generateRefreshToken();
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: await argon2.hash(refreshToken),
        expiresAt: this.refreshExpiry(),
      },
      select: { id: true },
    });

    return {
      user,
      accessToken: await this.createAccessToken(user),
      refreshToken,
      sessionId: session.id,
    };
  }

  private createAccessToken(user: AuthUser): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      username: user.username,
    };

    return this.jwtService.signAsync(payload, {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
  }

  private generateRefreshToken(): string {
    return randomBytes(64).toString('base64url');
  }

  private refreshExpiry(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
  }

  private toAuthUser(user: AuthUser): AuthUser {
    return {
      id: user.id,
      username: user.username,
      nametag: user.nametag,
    };
  }
}
