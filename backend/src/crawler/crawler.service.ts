import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { CrawlJob } from '../entities/crawl-job.entity';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private currentProcess: ChildProcess | null = null;
  private isRunning = false;

  constructor(
    @InjectRepository(CrawlJob)
    private readonly crawlJobRepo: Repository<CrawlJob>,
  ) {}

  async getStatus(): Promise<CrawlJob | null> {
    return this.crawlJobRepo.findOne({
      where: { status: '진행중' },
      order: { startTime: 'DESC' },
    });
  }

  async start(dto: {
    id?: string;
    category?: string;
    script?: string;
    startPage?: number;
    endPage?: number;
  }): Promise<{ success: boolean; jobId: string; message?: string }> {
    if (this.isRunning) {
      return { success: false, jobId: '', message: '이미 크롤링이 진행 중입니다.' };
    }

    const jobId = dto.id || `crawl_${Date.now()}`;
    const category = dto.category || 'unknown';
    const now = new Date().toISOString();

    const job = this.crawlJobRepo.create({
      id: jobId,
      category,
      startTime: now,
      endTime: null,
      status: '진행중',
      resultSummary: null,
    });
    await this.crawlJobRepo.save(job);

    if (dto.script) {
      const scriptPath = path.join(
        process.cwd(),
        '../31_Digo/crawler/jobkorea',
        dto.script,
      );

      try {
        const args: string[] = [];
        if (dto.startPage !== undefined) args.push(String(dto.startPage));
        if (dto.endPage !== undefined) args.push(String(dto.endPage));

        this.currentProcess = spawn('node', [scriptPath, ...args], {
          stdio: 'pipe',
        });

        this.isRunning = true;

        this.currentProcess.on('close', async (code) => {
          this.isRunning = false;
          this.currentProcess = null;

          const endTime = new Date().toISOString();
          const status = code === 0 ? '완료' : '오류';
          await this.crawlJobRepo.update(jobId, { endTime, status });
          this.logger.log(`Crawl job ${jobId} finished with code ${code}`);
        });

        this.currentProcess.on('error', async (err) => {
          this.isRunning = false;
          this.currentProcess = null;
          this.logger.error(`Crawl process error: ${err.message}`);
          await this.crawlJobRepo.update(jobId, {
            status: '오류',
            endTime: new Date().toISOString(),
            resultSummary: err.message,
          });
        });
      } catch (err) {
        this.isRunning = false;
        this.logger.error(`Failed to spawn crawler: ${(err as Error).message}`);
        await this.crawlJobRepo.update(jobId, {
          status: '오류',
          endTime: new Date().toISOString(),
          resultSummary: (err as Error).message,
        });
        return { success: false, jobId, message: (err as Error).message };
      }
    }

    return { success: true, jobId };
  }

  async stop(): Promise<{ success: boolean; message: string }> {
    if (!this.currentProcess || !this.isRunning) {
      return { success: false, message: '실행 중인 크롤링이 없습니다.' };
    }

    this.currentProcess.kill('SIGTERM');
    this.isRunning = false;
    this.currentProcess = null;

    return { success: true, message: '크롤링을 중지했습니다.' };
  }

  async finish(dto: {
    id: string;
    endTime?: string;
    status?: string;
    tried?: number;
    found?: number;
    category?: string;
  }): Promise<{ success: boolean }> {
    const endTime = dto.endTime || new Date().toISOString();
    const status = dto.status || '완료';

    const summary = JSON.stringify({
      tried: dto.tried,
      found: dto.found,
      category: dto.category,
    });

    await this.crawlJobRepo.update(dto.id, {
      endTime,
      status,
      resultSummary: summary,
    });

    return { success: true };
  }

  async getHistory(): Promise<CrawlJob[]> {
    return this.crawlJobRepo.find({
      order: { startTime: 'DESC' },
      take: 10,
    });
  }
}
