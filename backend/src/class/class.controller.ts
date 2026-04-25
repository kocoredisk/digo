import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/session.guard';
import { ClassService } from './class.service';

@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // 나이스페이먼츠 returnUrl — 브라우저가 카드 인증 후 POST로 호출
  @Post('payment/confirm-redirect')
  async confirmRedirect(@Body() body: any, @Res() res: Response) {
    const { authResultCode, authToken, tid, amount, orderId } = body;

    if (authResultCode !== '0000') {
      return res.redirect(`/axfirststone.html?error=${encodeURIComponent('카드 인증 실패: ' + authResultCode)}`);
    }

    try {
      await this.classService.confirmRedirect({ authToken, tid, amount: Number(amount), orderId });
      return res.redirect('/axfirststone.html?result=success');
    } catch (e: any) {
      return res.redirect(`/axfirststone.html?error=${encodeURIComponent(e.message || '승인 실패')}`);
    }
  }

  @Post('payment/confirm')
  confirmPayment(@Body() body: {
    authToken: string;
    tid: string;
    amount: number;
    orderId: string;
    name: string;
    phone: string;
    email: string;
    company?: string;
    courseName: string;
  }) {
    return this.classService.confirmPayment(body);
  }

  // 잔여석 공개 API — 인증 불필요
  @Get('seats')
  getSeats() {
    return this.classService.getSeats();
  }

  @Get('registrations')
  @UseGuards(JwtAuthGuard)
  getRegistrations() {
    return this.classService.getRegistrations();
  }

  @Patch('registrations/:id')
  @UseGuards(JwtAuthGuard)
  updateRegistration(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { paymentStatus?: string },
  ) {
    return this.classService.updateRegistration(id, dto);
  }
}
