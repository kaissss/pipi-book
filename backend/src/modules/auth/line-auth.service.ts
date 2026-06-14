import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface LineTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
}

@Injectable()
export class LineAuthService {
  private readonly logger = new Logger(LineAuthService.name);

  constructor(private readonly configService: ConfigService) {}

  async exchangeCodeForToken(
    code: string,
    redirectUri?: string,
  ): Promise<LineTokenResponse> {
    const channelId = this.configService.get<string>('line.channelId');
    const channelSecret = this.configService.get<string>('line.channelSecret');
    const defaultRedirectUri = this.configService.get<string>('line.redirectUri');

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri || defaultRedirectUri,
      client_id: channelId,
      client_secret: channelSecret,
    });

    try {
      const response = await axios.post<LineTokenResponse>(
        'https://api.line.me/oauth2/v2.1/token',
        params.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      this.logger.log({
        message: 'LINE token exchange successful',
        expiresIn: response.data.expires_in,
      });

      return response.data;
    } catch (error) {
      this.logger.error({
        message: 'LINE token exchange failed',
        error: error.response?.data || error.message,
      });
      throw new UnauthorizedException('Failed to exchange LINE authorization code');
    }
  }

  async getUserProfile(accessToken: string): Promise<LineUserProfile> {
    try {
      const response = await axios.get<LineUserProfile>(
        'https://api.line.me/v2/profile',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      this.logger.log({
        message: 'LINE profile fetched',
        userId: response.data.userId,
      });

      return response.data;
    } catch (error) {
      this.logger.error({
        message: 'Failed to fetch LINE user profile',
        error: error.response?.data || error.message,
      });
      throw new UnauthorizedException('Failed to fetch LINE user profile');
    }
  }

  async verifyIdToken(idToken: string): Promise<{ email?: string; sub: string }> {
    const channelId = this.configService.get<string>('line.channelId');

    try {
      const params = new URLSearchParams({
        id_token: idToken,
        client_id: channelId,
      });

      const response = await axios.post(
        'https://api.line.me/oauth2/v2.1/verify',
        params.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      return {
        sub: response.data.sub,
        email: response.data.email,
      };
    } catch (error) {
      this.logger.warn({
        message: 'LINE ID token verification failed',
        error: error.response?.data || error.message,
      });
      return { sub: '' };
    }
  }
}
