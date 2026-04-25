import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/session.guard';
import { LinkeeService } from './linkee.service';

@Controller('api/linkee-mails')
@UseGuards(JwtAuthGuard)
export class LinkeeController {
  constructor(private readonly linkeeService: LinkeeService) {}

  @Get('sets')
  getSets() {
    return this.linkeeService.getSets();
  }

  @Post('send')
  sendBatch(@Body() body: { batch_no: number }) {
    return this.linkeeService.sendBatch(body.batch_no);
  }

  @Get('optout')
  getOptout() {
    return this.linkeeService.getOptout();
  }
}
