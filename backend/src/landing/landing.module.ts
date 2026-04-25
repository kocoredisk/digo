import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';
import { LandingSource } from '../entities/landing-source.entity';
import { LandingMapping } from '../entities/landing-mapping.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LandingSource, LandingMapping]),
    AuthModule,
  ],
  controllers: [LandingController],
  providers: [LandingService],
  exports: [LandingService],
})
export class LandingModule {}
