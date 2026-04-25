import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 10 })
  date: string;

  @Column({ type: 'varchar', length: 10 })
  time: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'integer', nullable: true, name: 'customer_id' })
  customerId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'customer_name' })
  customerName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'customer_region' })
  customerRegion: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
