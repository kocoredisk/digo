import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { JwtAuthGuard } from '../auth/session.guard';

@Controller('api/crawl')
@UseGuards(JwtAuthGuard)
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('jobkorea-status')
  async getStatus() {
    return this.crawlerService.getStatus();
  }

  @Post('jobkorea-start')
  async start(
    @Body()
    body: {
      id?: string;
      category?: string;
      script?: string;
      startPage?: number;
      endPage?: number;
    },
  ) {
    return this.crawlerService.start(body);
  }

  @Post('jobkorea-stop')
  async stop() {
    return this.crawlerService.stop();
  }

  @Post('jobkorea-finish')
  async finish(
    @Body()
    body: {
      id: string;
      endTime?: string;
      status?: string;
      tried?: number;
      found?: number;
      category?: string;
    },
  ) {
    return this.crawlerService.finish(body);
  }

  @Get('jobkorea-history')
  async getHistory() {
    return this.crawlerService.getHistory();
  }
}
