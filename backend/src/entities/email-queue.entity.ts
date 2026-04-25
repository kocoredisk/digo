import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('email_queue')
export class EmailQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'customer_id' })
  customerId: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'varchar', length: 50, name: 'campaign_type' })
  campaignType: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 50, name: 'created_at' })
  createdAt: string;

  @Column({ type: 'varchar', length: 10, name: 'scheduled_date' })
  scheduledDate: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'sent_at' })
  sentAt: string | null;
}
