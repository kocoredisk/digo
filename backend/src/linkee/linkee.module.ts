import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LinkeeMail } from '../entities/linkee-mail.entity';
import { EmailQueue } from '../entities/email-queue.entity';
import { LinkeeService } from './linkee.service';
import { LinkeeController } from './linkee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LinkeeMail, EmailQueue]), AuthModule],
  providers: [LinkeeService],
  controllers: [LinkeeController],
})
export class LinkeeModule {}
