import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'])
@Index(['provider', 'provider_id'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, default: 'google' })
  provider: string; // 'google', 'kakao', 'naver'

  @Column({ type: 'varchar', length: 255, nullable: true })
  provider_id: string;

  @Column({ type: 'integer', default: 0, name: 'session_version' })
  sessionVersion: number;

  @Column({ type: 'boolean', default: false, name: 'is_admin' })
  isAdmin: boolean;

  // 프로필
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'nickname' })
  nickname: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'profile_avatar' })
  profileAvatar: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
