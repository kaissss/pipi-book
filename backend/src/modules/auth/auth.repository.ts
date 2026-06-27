import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, RefreshToken } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByLineUserId(lineUserId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { lineUserId } });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: {
    lineUserId: string;
    displayName?: string;
    avatar?: string;
    email?: string;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async updateUser(
    id: string,
    data: Partial<{ displayName: string; avatar: string; email: string; phone: string }>,
  ): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async upsertUser(data: {
    lineUserId: string;
    displayName?: string;
    avatar?: string;
    email?: string;
  }): Promise<User> {
    return this.prisma.user.upsert({
      where: { lineUserId: data.lineUserId },
      update: {
        displayName: data.displayName,
        avatar: data.avatar,
        ...(data.email && { email: data.email }),
      },
      create: data,
    });
  }

  async createRefreshToken(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { token } });
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async deleteExpiredRefreshTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}
