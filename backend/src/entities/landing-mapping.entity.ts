import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('landing_service_salesperson_mappings')
export class LandingMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'landing_folder' })
  landingFolder: string;

  @Column({ type: 'integer', name: 'service_id' })
  serviceId: number;

  @Column({ type: 'integer', name: 'salesperson_id' })
  salespersonId: number;

  @Column({ type: 'varchar', length: 500, name: 'url_path' })
  urlPath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
