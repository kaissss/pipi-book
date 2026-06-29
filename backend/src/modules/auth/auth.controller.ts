import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LineLoginDto, RefreshTokenDto } from './dto/line-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DevLoginDto } from './dto/dev-login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('line/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange LINE authorization code for JWT tokens' })
  async lineCallback(@Body() dto: LineLoginDto) {
    return this.authService.lineLogin(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Req() req: any, @Body() dto: RefreshTokenDto) {
    const { sub } = req.user;
    return this.authService.refreshAccessToken(sub, dto.refreshToken);
  }

  @Public()
  @Post('dev/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dev-only login (non-production) — issues tokens without LINE' })
  async devLogin(@Body() dto: DevLoginDto) {
    return this.authService.devLogin(dto.role);
  }

  @Get('me')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get the current authenticated user' })
  async getMe(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.getMe(user.sub);
  }

  @Patch('me')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update the current user profile' })
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.sub, dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RefreshTokenDto,
  ) {
    await this.authService.logout(user.sub, dto.refreshToken);
    return { message: 'Successfully logged out' };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAll(@CurrentUser() user: CurrentUserPayload) {
    await this.authService.logout(user.sub);
    return { message: 'Successfully logged out from all devices' };
  }
}
