import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseBoolPipe,
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

@ApiTags('Services')
@ApiBearerAuth('JWT')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new coaching service' })
  async createService(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateServiceDto,
  ) {
    return this.serviceService.createService(user.sub, dto);
  }

  @Public()
  @Get('coach/:coachId')
  @ApiOperation({ summary: "List a coach's services" })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async getCoachServices(
    @Param('coachId', ParseUUIDPipe) coachId: string,
    @Query('activeOnly') activeOnly: boolean = true,
  ) {
    return this.serviceService.getCoachServices(coachId, activeOnly);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  async getService(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceService.getService(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service' })
  async updateService(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateServiceDto>,
  ) {
    return this.serviceService.updateService(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a service' })
  async deleteService(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.serviceService.deleteService(user.sub, id);
  }
}
