import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailQueue } from '../entities/email-queue.entity';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(EmailQueue)
    private readonly emailQueueRepo: Repository<EmailQueue>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  private createTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_SENDER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const transporter = this.createTransporter();
    await transporter.sendMail({
      from: process.env.GMAIL_SENDER,
      to,
      subject,
      html,
    });
  }

  async getQueueStatus(): Promise<{
    pending: number;
    sent: number;
    failed: number;
    today: string;
  }> {
    const today = new Date().toISOString().slice(0, 10);

    const [pending, sent, failed] = await Promise.all([
      this.emailQueueRepo.count({
        where: { scheduledDate: today, status: 'pending' },
      }),
      this.emailQueueRepo.count({
        where: { scheduledDate: today, status: 'sent' },
      }),
      this.emailQueueRepo.count({
        where: { scheduledDate: today, status: 'failed' },
      }),
    ]);

    return { pending, sent, failed, today };
  }

  async addToQueue(
    customerIds: number[],
    campaignType: string,
    currentFilter: string,
  ): Promise<{ added: number; skipped: number; limitReached: boolean }> {
    const today = new Date().toISOString().slice(0, 10);

    // 일일 480개 제한 체크
    const todayCount = await this.emailQueueRepo.count({
      where: { scheduledDate: today },
    });

    const remaining = 480 - todayCount;
    if (remaining <= 0) {
      return { added: 0, skipped: customerIds.length, limitReached: true };
    }

    const idsToProcess = customerIds.slice(0, remaining);
    const skipped = customerIds.length - idsToProcess.length;

    const customers = await this.customerRepo.findByIds(idsToProcess);
    const validCustomers = customers.filter((c) => c.email);

    const now = new Date().toISOString();
    const entries: Partial<EmailQueue>[] = validCustomers.map((c) => ({
      customerId: c.id,
      email: c.email!,
      name: c.name,
      campaignType,
      status: 'pending',
      createdAt: now,
      scheduledDate: today,
      sentAt: null,
    }));

    if (entries.length > 0) {
      await this.emailQueueRepo.save(entries);
    }

    return {
      added: entries.length,
      skipped: skipped + (idsToProcess.length - entries.length),
      limitReached: customerIds.length > remaining,
    };
  }

  async processQueue(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const pendingItems = await this.emailQueueRepo.find({
      where: { scheduledDate: today, status: 'pending' },
    });

    for (const item of pendingItems) {
      try {
        const subject = `${item.name} 관리자님. 탄탄경리 서비스 안내드립니다.`;
        const html = `<p>안녕하세요, 탄탄경리 서비스입니다.</p>`;

        await this.sendMail(item.email, subject, html);

        item.status = 'sent';
        item.sentAt = new Date().toISOString();
        await this.emailQueueRepo.save(item);

        // 발송 간격 (rate limit 방지)
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        this.logger.error(`Failed to send email to ${item.email}`, err);
        item.status = 'failed';
        await this.emailQueueRepo.save(item);
      }
    }
  }

  async getEmailStats(
    from: string,
    to: string,
  ): Promise<{ date: string; count: number; type: string }[]> {
    const customers = await this.customerRepo.find();

    const statMap: Record<string, Record<string, number>> = {};

    const addStat = (date: string | null, type: string) => {
      if (!date || date < from || date > to) return;
      if (!statMap[date]) statMap[date] = {};
      statMap[date][type] = (statMap[date][type] || 0) + 1;
    };

    for (const c of customers) {
      addStat(c.firstSentDate, 'first');
      addStat(c.secondSentDate, 'second');
      addStat(c.thirdSentDate, 'third');
    }

    const result: { date: string; count: number; type: string }[] = [];
    for (const [date, types] of Object.entries(statMap)) {
      for (const [type, count] of Object.entries(types)) {
        result.push({ date, count, type });
      }
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  async getQueueList(): Promise<EmailQueue[]> {
    return this.emailQueueRepo.find({
      order: { id: 'DESC' },
    });
  }
}
