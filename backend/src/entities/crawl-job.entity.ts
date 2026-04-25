import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('crawl_jobs')
export class CrawlJob {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 50, name: 'start_time' })
  startTime: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'end_time' })
  endTime: string | null;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @Column({ type: 'text', nullable: true, name: 'result_summary' })
  resultSummary: string | null;
}
