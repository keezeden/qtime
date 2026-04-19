import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
  SESSION_ID_COOKIE,
} from './auth.constants';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import type { AuthUser } from './types/auth-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.signup(signupDto);
    this.setAuthCookies(response, session);
    return { user: session.user };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(loginDto);
    this.setAuthCookies(response, session);
    return { user: session.user };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.refresh(
      request.cookies?.[SESSION_ID_COOKIE],
      request.cookies?.[REFRESH_TOKEN_COOKIE],
    );
    this.setAuthCookies(response, session);
    return { user: session.user };
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.revokeSession(request.cookies?.[SESSION_ID_COOKIE]);
    this.clearAuthCookies(response);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }

  private setAuthCookies(
    response: Response,
    session: {
      accessToken: string;
      refreshToken: string;
      sessionId: string;
    },
  ): void {
    response.cookie(ACCESS_TOKEN_COOKIE, session.accessToken, {
      ...this.cookieDefaults(),
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    });
    response.cookie(REFRESH_TOKEN_COOKIE, session.refreshToken, {
      ...this.cookieDefaults(),
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });
    response.cookie(SESSION_ID_COOKIE, session.sessionId, {
      ...this.cookieDefaults(),
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });
  }

  private clearAuthCookies(response: Response): void {
    response.clearCookie(ACCESS_TOKEN_COOKIE, this.cookieDefaults());
    response.clearCookie(REFRESH_TOKEN_COOKIE, this.cookieDefaults());
    response.clearCookie(SESSION_ID_COOKIE, this.cookieDefaults());
  }

  private cookieDefaults(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
  }
}
