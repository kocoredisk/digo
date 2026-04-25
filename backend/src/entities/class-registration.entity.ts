import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('class_registrations')
export class ClassRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string | null;

  @Column({ type: 'varchar', length: 255, name: 'course_name' })
  courseName: string;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ type: 'varchar', length: 50, default: 'pending', name: 'payment_status' })
  paymentStatus: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tid: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'order_id' })
  orderId: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}