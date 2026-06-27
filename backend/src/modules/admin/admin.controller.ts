import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CoachStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { RejectCoachDto } from './dto/reject-coach.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.constant';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform dashboard statistics' })
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users (search/filter/paginated)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.adminService.listUsers({ search, role, page, limit });
  }

  @Patch('users/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a user' })
  async suspendUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.suspendUser(id);
  }

  @Patch('users/:id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate a user' })
  async activateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.activateUser(id);
  }

  @Get('coaches')
  @ApiOperation({ summary: 'List coaches by status (paginated)' })
  @ApiQuery({ name: 'status', required: false, enum: CoachStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listCoaches(
    @Query('status') status?: CoachStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.adminService.listCoaches(status, page, limit);
  }

  @Patch('coaches/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a coach' })
  async approveCoach(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.approveCoach(id);
  }

  @Patch('coaches/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a coach application' })
  async rejectCoach(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectCoachDto,
  ) {
    return this.adminService.rejectCoach(id, dto.reason);
  }

  @Patch('coaches/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a coach' })
  async suspendCoach(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.suspendCoach(id);
  }

  @Get('bookings/recent')
  @ApiOperation({ summary: 'List recent bookings' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentBookings(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.adminService.getRecentBookings(limit);
  }
}
