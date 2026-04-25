import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { User } from './entities/user.entity';
import { Customer } from './entities/customer.entity';
import { ServiceEntity } from './entities/service.entity';
import { Salesperson } from './entities/salesperson.entity';
import { Company } from './entities/company.entity';
import { Application } from './entities/application.entity';
import { MasterModule } from './master/master.module';
import { ApplicationsModule } from './applications/applications.module';
import { ConsultationApplication } from './entities/consultation.entity';
import { Schedule } from './entities/schedule.entity';
import { Tag } from './entities/tag.entity';
import { EmailQueue } from './entities/email-queue.entity';
import { CrawlJob } from './entities/crawl-job.entity';
import { LandingSource } from './entities/landing-source.entity';
import { LandingMapping } from './entities/landing-mapping.entity';
import { LinkeeMail } from './entities/linkee-mail.entity';
import { ClassRegistration } from './entities/class-registration.entity';
import { ConsultationsModule } from './consultations/consultations.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TagsModule } from './tags/tags.module';
import { EmailModule } from './email/email.module';
import { CrawlerModule } from './crawler/crawler.module';
import { LandingModule } from './landing/landing.module';
import { LinkeeModule } from './linkee/linkee.module';
import { ClassModule } from './class/class.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'digo_user'),
        password: configService.get('DB_PASSWORD', 'digo_pass_2026'),
        database: configService.get('DB_NAME', 'digo_db'),
        entities: [User, Customer, ServiceEntity, Salesperson, Company, Application, ConsultationApplication, Schedule, Tag, EmailQueue, CrawlJob, LandingSource, LandingMapping, LinkeeMail, ClassRegistration],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: false,
        connectTimeoutMS: 5000,
        retryAttempts: 5,
        retryDelay: 2000,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CustomersModule,
    MasterModule,
    ApplicationsModule,
    ConsultationsModule,
    SchedulesModule,
    TagsModule,
    EmailModule,
    CrawlerModule,
    LandingModule,
    LinkeeModule,
    ClassModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
