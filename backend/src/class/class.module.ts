import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ClassRegistration } from '../entities/class-registration.entity';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassRegistration]),
    ConfigModule,
    AuthModule,
  ],
  providers: [ClassService],
  controllers: [ClassController],
})
export class ClassModule {}
