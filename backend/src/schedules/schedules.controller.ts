import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/session.guard';
import { SchedulesService } from './schedules.service';

@Controller('api/schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.schedulesService.findAll(query);
  }

  @Post()
  create(@Body() dto: Record<string, any>) {
    return this.schedulesService.create(dto as any);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
}
