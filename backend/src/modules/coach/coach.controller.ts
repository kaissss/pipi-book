import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CoachService } from './coach.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../../common/constants/roles.constant';

@ApiTags('Coach')
@ApiBearerAuth('JWT')
@Controller('coaches')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create coach profile for current user' })
  async createProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCoachDto,
  ) {
    return this.coachService.createProfile(user.sub, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my coach profile' })
  async getMyProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.coachService.getMyProfile(user.sub);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all approved coaches' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listCoaches(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.coachService.listApprovedCoaches(page, limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get coach profile by ID' })
  async getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachService.getProfile(id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update my coach profile' })
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateCoachDto,
  ) {
    return this.coachService.updateProfile(user.sub, dto);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve a coach (admin only)' })
  async approveCoach(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachService.approveCoach(id);
  }
}
