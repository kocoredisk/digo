import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from '../entities/service.entity';
import { Salesperson } from '../entities/salesperson.entity';
import { Company } from '../entities/company.entity';
import { MasterService } from './master.service';
import { MasterController } from './master.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceEntity, Salesperson, Company]),
    AuthModule,
  ],
  controllers: [MasterController],
  providers: [MasterService],
})
export class MasterModule {}
