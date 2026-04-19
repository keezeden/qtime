import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

const safeUserSelect = {
  id: true,
  username: true,
  nametag: true,
} as const;

type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: Prisma.UserCreateInput): Promise<SafeUser> {
    return this.prisma.user.create({
      data: createUserDto,
      select: safeUserSelect,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: safeUserSelect,
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: safeUserSelect,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: safeUserSelect,
    });
  }
}
