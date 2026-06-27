import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

// Routed under /coaches/* to match the client's resource model.
@ApiTags('Services')
@ApiBearerAuth('JWT')
@Controller('coaches')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Public()
  @Get(':coachId/services')
  @ApiOperation({ summary: "List a coach's services" })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async getCoachServices(
    @Param('coachId', ParseUUIDPipe) coachId: string,
    @Query('activeOnly', new DefaultValuePipe(true), ParseBoolPipe) activeOnly = true,
  ) {
    return this.serviceService.getCoachServices(coachId, activeOnly);
  }

  @Post('me/services')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a service for the current coach' })
  async createService(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateServiceDto,
  ) {
    return this.serviceService.createService(user.sub, dto);
  }

  @Patch('me/services/:serviceId')
  @ApiOperation({ summary: 'Update a service' })
  async updateService(
    @CurrentUser() user: CurrentUserPayload,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Body() dto: Partial<CreateServiceDto>,
  ) {
    return this.serviceService.updateService(user.sub, serviceId, dto);
  }

  @Delete('me/services/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a service' })
  async deleteService(
    @CurrentUser() user: CurrentUserPayload,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ) {
    await this.serviceService.deleteService(user.sub, serviceId);
  }
}
