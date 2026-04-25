import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('landing_sources')
export class LandingSource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'service_id' })
  serviceId: number;

  @Column({ type: 'integer', nullable: true, name: 'company_id' })
  companyId: number | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
