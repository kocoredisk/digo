import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from '../entities/customer.entity';
import { JwtAuthGuard } from '../auth/session.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // POST /api/change-category (최상단 별도 경로)
  @Post('api/change-category')
  changeCategory(@Body() body: { customerIds: number[]; category: string }) {
    return this.customersService.changeCategory(body.customerIds, body.category);
  }

  // GET /api/customers
  @Get('api/customers')
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
  ) {
    return this.customersService.findAll({ startDate, endDate, category });
  }

  // POST /api/customers
  @Post('api/customers')
  create(@Body() dto: Partial<Customer>) {
    return this.customersService.create(dto);
  }

  // PUT /api/customers/bulk-category (반드시 /:id 보다 먼저)
  @Put('api/customers/bulk-category')
  bulkCategory(@Body() body: { customerIds: number[]; category: string }) {
    return this.customersService.changeCategory(body.customerIds, body.category);
  }

  // POST /api/customers/exclude (반드시 /:id 보다 먼저)
  @Post('api/customers/exclude')
  bulkExclude(@Body() body: { ids: number[] }) {
    return this.customersService.bulkExclude(body.ids);
  }

  // GET /api/customers/tags (반드시 /:id 보다 먼저)
  @Get('api/customers/tags')
  findAllWithTags(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.customersService.findAllWithTags({ startDate, endDate });
  }

  // PATCH /api/customers/tags/bulk (반드시 /:id 보다 먼저)
  @Patch('api/customers/tags/bulk')
  bulkUpdateTags(@Body() body: { customers: Array<{ customerId: number; tags: string }> }) {
    return this.customersService.bulkUpdateTags(body.customers);
  }

  // GET /api/customers/:id
  @Get('api/customers/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  // PUT /api/customers/:id
  @Put('api/customers/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<Customer>,
  ) {
    return this.customersService.update(id, dto);
  }

  // DELETE /api/customers/:id
  @Delete('api/customers/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }

  // POST /api/customers/:id/exclude
  @Post('api/customers/:id/exclude')
  excludeCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.excludeCustomer(id);
  }
}
