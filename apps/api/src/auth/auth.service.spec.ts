import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    session: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      session: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('access-token'),
    };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user with a hashed password and starts a session', async () => {
    jest.mocked(argon2.hash).mockResolvedValue('hashed-value');
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      username: 'keez',
      nametag: 'OCE',
    });
    prisma.session.create.mockResolvedValue({ id: 'session-id' });

    const result = await service.signup({
      username: ' keez ',
      password: 'password123',
      nametag: 'OCE',
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: 'keez',
        nametag: 'OCE',
        passwordHash: 'hashed-value',
      },
      select: {
        id: true,
        username: true,
        nametag: true,
      },
    });
    expect(result).toMatchObject({
      user: { id: 1, username: 'keez', nametag: 'OCE' },
      accessToken: 'access-token',
      sessionId: 'session-id',
    });
    expect(result.refreshToken).toEqual(expect.any(String));
  });

  it('rejects duplicate signup usernames', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });

    await expect(
      service.signup({
        username: 'keez',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid login credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'keez',
      nametag: null,
      passwordHash: 'hashed-password',
    });
    jest.mocked(argon2.verify).mockResolvedValue(false);

    await expect(
      service.login({
        username: 'keez',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates refresh tokens for valid sessions', async () => {
    jest.mocked(argon2.hash).mockResolvedValue('next-hash');
    jest.mocked(argon2.verify).mockResolvedValue(true);
    prisma.session.findUnique.mockResolvedValue({
      id: 'session-id',
      refreshTokenHash: 'current-hash',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user: {
        id: 1,
        username: 'keez',
        nametag: 'OCE',
      },
    });
    prisma.session.update.mockResolvedValue({ id: 'session-id' });

    const result = await service.refresh('session-id', 'refresh-token');

    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 'session-id' },
      data: {
        refreshTokenHash: 'next-hash',
        expiresAt: expect.any(Date),
      },
    });
    expect(result).toMatchObject({
      user: { id: 1, username: 'keez', nametag: 'OCE' },
      accessToken: 'access-token',
      sessionId: 'session-id',
    });
  });
});
