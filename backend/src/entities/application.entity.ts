import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'service_type' })
  serviceType: string;

  @Column({ type: 'varchar', length: 500, name: 'biz_nm' })
  bizNm: string;

  @Column({ type: 'varchar', length: 255, name: 'user_nm' })
  userNm: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 255, name: 'sales_person' })
  salesPerson: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'sales_code' })
  salesCode: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'utm_source' })
  utmSource: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'utm_medium' })
  utmMedium: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'utm_campaign' })
  utmCampaign: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'utm_term' })
  utmTerm: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'utm_content' })
  utmContent: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer: string | null;

  @Column({ type: 'varchar', length: 10, name: 'reg_date' })
  regDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
