import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('linkee_mails')
export class LinkeeMail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'sent_at' })
  sentAt: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'boolean', default: false })
  optout: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'optout_at' })
  optoutAt: string | null;
}
