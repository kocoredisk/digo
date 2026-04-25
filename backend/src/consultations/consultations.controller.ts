import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/session.guard';
import { ConsultationsService } from './consultations.service';

@Controller('api/consultations')
@UseGuards(JwtAuthGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.consultationsService.findAll(query);
  }

  @Post()
  create(@Body() dto: Record<string, any>) {
    return this.consultationsService.create(dto as any);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Record<string, any>,
  ) {
    return this.consultationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.consultationsService.remove(id);
  }
}
