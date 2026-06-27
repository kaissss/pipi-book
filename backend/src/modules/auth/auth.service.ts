import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from './auth.repository';
import { LineAuthService } from './line-auth.service';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { LineLoginDto } from './dto/line-login.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly lineAuthService: LineAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async lineLogin(dto: LineLoginDto): Promise<AuthResponseDto> {
    const tokenData = await this.lineAuthService.exchangeCodeForToken(
      dto.code,
      dto.redirectUri,
    );

    const profile = await this.lineAuthService.getUserProfile(
      tokenData.access_token,
    );

    let email: string | undefined;
    if (tokenData.id_token) {
      const verified = await this.lineAuthService.verifyIdToken(
        tokenData.id_token,
      );
      email = verified.email;
    }

    const user = await this.authRepository.upsertUser({
      lineUserId: profile.userId,
      displayName: profile.displayName,
      avatar: profile.pictureUrl,
      email,
    });

    this.logger.log({
      message: 'User logged in via LINE',
      userId: user.id,
      lineUserId: profile.userId,
    });

    return this.generateAuthResponse(user);
  }

  async refreshAccessToken(
    userId: string,
    refreshToken: string,
  ): Promise<RefreshResponseDto> {
    const storedToken = await this.authRepository.findRefreshToken(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.userId !== userId) {
      throw new UnauthorizedException('Refresh token does not belong to user');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(refreshToken);
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = await this.authRepository.findUserById(userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    const accessToken = this.signAccessToken(user);
    const expiresIn = this.getAccessTokenTtlSeconds();

    this.logger.log({
      message: 'Access token refreshed',
      userId: user.id,
    });

    return { accessToken, expiresIn };
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.toUserResponse(user);
  }

  async updateProfile(
    userId: string,
    data: Partial<{ displayName: string; email: string; phone: string }>,
  ) {
    const user = await this.authRepository.updateUser(userId, {
      ...(data.displayName !== undefined && { displayName: data.displayName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
    });
    this.logger.log({ message: 'Profile updated', userId });
    return this.toUserResponse(user);
  }

  private toUserResponse(user: User) {
    return {
      id: user.id,
      lineUserId: user.lineUserId ?? '',
      displayName: user.displayName ?? '',
      avatar: user.avatar ?? undefined,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.authRepository.deleteRefreshToken(refreshToken).catch(() => {});
    } else {
      await this.authRepository.deleteAllUserRefreshTokens(userId);
    }

    this.logger.log({ message: 'User logged out', userId });
  }

  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const accessToken = this.signAccessToken(user);
    const { token: refreshToken, expiresAt } = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getAccessTokenTtlSeconds(),
      user: {
        id: user.id,
        lineUserId: user.lineUserId ?? '',
        email: user.email ?? undefined,
        displayName: user.displayName ?? undefined,
        avatar: user.avatar ?? undefined,
        role: user.role,
        status: user.status,
      },
    };
  }

  private signAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      lineUserId: user.lineUserId,
      role: user.role,
      email: user.email,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m'),
    });
  }

  private async createRefreshToken(
    userId: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const tokenId = uuidv4();
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.get<string>(
      'jwt.refreshExpiresIn',
      '7d',
    );

    const token = this.jwtService.sign(
      { sub: userId, tokenId },
      { secret: refreshSecret, expiresIn: refreshExpiresIn },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.createRefreshToken({ userId, token, expiresAt });

    return { token, expiresAt };
  }

  private getAccessTokenTtlSeconds(): number {
    return 15 * 60; // 15 minutes in seconds
  }
}
