import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/session.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('email-queue-status')
  async getQueueStatus() {
    return this.emailService.getQueueStatus();
  }

  @Get('email-queue-list')
  async getQueueList() {
    return this.emailService.getQueueList();
  }

  @Post('send-bulk-email')
  async sendBulkEmail(
    @Body()
    body: {
      customerIds: number[];
      campaignType: string;
      currentFilter: string;
    },
  ) {
    return this.emailService.addToQueue(
      body.customerIds,
      body.campaignType,
      body.currentFilter,
    );
  }

  @Post('send-consultation-email')
  async sendConsultationEmail(
    @Body() body: { email: string; name: string; contactName: string },
  ) {
    const subject = `${body.name} 관리자님. 탄탄경리 상담 안내드립니다.`;
    const html = `<p>안녕하세요, ${body.contactName}님. 탄탄경리 서비스 상담을 신청해 주셔서 감사합니다.</p>`;
    await this.emailService.sendMail(body.email, subject, html);
    return { success: true };
  }

  @Post('send-campaign-email')
  async sendCampaignEmail(
    @Body()
    body: {
      email: string;
      companyName: string;
      contactName: string;
      subject: string;
      html: string;
    },
  ) {
    await this.emailService.sendMail(body.email, body.subject, body.html);
    return { success: true };
  }

  @Get('email-sending-stats')
  async getEmailStats(@Query('from') from: string, @Query('to') to: string) {
    return this.emailService.getEmailStats(from, to);
  }

  @Post('process-email-queue')
  async processEmailQueue() {
    // 비동기 백그라운드 처리 (응답은 즉시 반환)
    this.emailService.processQueue().catch((err) => {
      console.error('Queue processing error:', err);
    });
    return { success: true, message: '큐 처리를 시작했습니다.' };
  }
}
