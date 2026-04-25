import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MasterService } from './master.service';
import { JwtAuthGuard } from '../auth/session.guard';

@UseGuards(JwtAuthGuard)
@Controller('api')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  // --- Services ---
  @Get('services')
  getServices() {
    return this.masterService.getServices();
  }

  @Post('services')
  createService(@Body() body: { name: string; identifier: string }) {
    return this.masterService.createService(body);
  }

  @Put('services/:id/toggle')
  toggleService(@Param('id', ParseIntPipe) id: number) {
    return this.masterService.toggleService(id);
  }

  @Delete('services/:id')
  deleteService(@Param('id', ParseIntPipe) id: number) {
    return this.masterService.deleteService(id);
  }

  // --- Salespersons ---
  @Get('salespersons')
  getSalespersons() {
    return this.masterService.getSalespersons();
  }

  @Post('salespersons')
  createSalesperson(@Body() body: { name: string; identifier: string }) {
    return this.masterService.createSalesperson(body);
  }

  @Put('salespersons/:id/toggle')
  toggleSalesperson(@Param('id', ParseIntPipe) id: number) {
    return this.masterService.toggleSalesperson(id);
  }

  @Delete('salespersons/:id')
  deleteSalesperson(@Param('id', ParseIntPipe) id: number) {
    return this.masterService.deleteSalesperson(id);
  }

  // --- Companies ---
  @Get('companies')
  getCompanies() {
    return this.masterService.getCompanies();
  }

  @Post('companies')
  createCompany(@Body() body: { name: string; identifier: string }) {
    return this.masterService.createCompany(body);
  }

  @Put('companies/:id/toggle')
  toggleCompany(@Param('id', ParseIntPipe) id: number) {
    return this.masterService.toggleCompany(id);
  }

  @Delete('companies/:id')
  deleteCompany(@Param('id', ParseIntPipe) id: number) {
    return this.masterService.deleteCompany(id);
  }
}
