import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LinkeeMail } from '../entities/linkee-mail.entity';
import { EmailQueue } from '../entities/email-queue.entity';

const BATCH_SIZE = 1500;

@Injectable()
export class LinkeeService {
  constructor(
    @InjectRepository(LinkeeMail)
    private readonly linkeeMailRepo: Repository<LinkeeMail>,
    @InjectRepository(EmailQueue)
    private readonly emailQueueRepo: Repository<EmailQueue>,
  ) {}

  async getSets(): Promise<
    {
      batchNo: number;
      start: number;
      end: number;
      total: number;
      sent: number;
      pending: number;
    }[]
  > {
    const total = await this.linkeeMailRepo.count({ where: { optout: false } });
    const batchCount = Math.ceil(total / BATCH_SIZE);

    const allMails = await this.linkeeMailRepo.find({
      where: { optout: false },
      order: { id: 'ASC' },
    });

    const result: { batchNo: number; start: number; end: number; total: number; sent: number; pending: number; }[] = [];
    for (let i = 0; i < batchCount; i++) {
      const batchMails = allMails.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const sent = batchMails.filter((m) => m.status === 'sent').length;
      const pending = batchMails.filter((m) => m.status === 'pending').length;

      result.push({
        batchNo: i + 1,
        start: i * BATCH_SIZE + 1,
        end: Math.min((i + 1) * BATCH_SIZE, total),
        total: batchMails.length,
        sent,
        pending,
      });
    }

    return result;
  }

  async sendBatch(batchNo: number): Promise<{
    success: boolean;
    added: number;
    message?: string;
  }> {
    const offset = (batchNo - 1) * BATCH_SIZE;
    const batchMails = await this.linkeeMailRepo.find({
      where: { optout: false },
      order: { id: 'ASC' },
      skip: offset,
      take: BATCH_SIZE,
    });

    if (batchMails.length === 0) {
      return { success: false, added: 0, message: '해당 배치가 없습니다.' };
    }

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const entries: Partial<EmailQueue>[] = batchMails
      .filter((m) => m.email)
      .map((m) => ({
        customerId: m.id,
        email: m.email,
        name: m.name || '',
        campaignType: `linkee_batch_${batchNo}`,
        status: 'pending',
        createdAt: now,
        scheduledDate: today,
        sentAt: null,
      }));

    if (entries.length > 0) {
      await this.emailQueueRepo.save(entries);
    }

    return { success: true, added: entries.length };
  }

  async getOptout(): Promise<LinkeeMail[]> {
    return this.linkeeMailRepo.find({
      where: { optout: true },
      order: { id: 'DESC' },
    });
  }
}
