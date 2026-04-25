import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  sn: string | null;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'contact_name' })
  contactName: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'reg_date' })
  regDate: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  region: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  link: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, default: '경리' })
  category: string | null;

  @Column({ type: 'text', nullable: true })
  tags: string | null;

  @Column({ type: 'integer', default: 0, name: 'is_excluded' })
  isExcluded: number;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'first_sent_date' })
  firstSentDate: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'first_sent_time' })
  firstSentTime: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'first_sent_type' })
  firstSentType: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'second_sent_date' })
  secondSentDate: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'second_sent_time' })
  secondSentTime: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'second_sent_type' })
  secondSentType: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'third_sent_date' })
  thirdSentDate: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'third_sent_time' })
  thirdSentTime: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'third_sent_type' })
  thirdSentType: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
