import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';

export interface FindSchedulesQuery {
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateScheduleDto {
  date: string;
  time: string;
  text: string;
  customerId?: number;
  customerName?: string;
  customerRegion?: string;
}

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly repo: Repository<Schedule>,
  ) {}

  async findAll(query: FindSchedulesQuery): Promise<Schedule[]> {
    const qb: SelectQueryBuilder<Schedule> = this.repo
      .createQueryBuilder('s')
      .orderBy('s.date', 'ASC')
      .addOrderBy('s.time', 'ASC');

    if (query.date) {
      qb.andWhere('s.date = :date', { date: query.date });
    } else {
      if (query.startDate) {
        qb.andWhere('s.date >= :startDate', { startDate: query.startDate });
      }
      if (query.endDate) {
        qb.andWhere('s.date <= :endDate', { endDate: query.endDate });
      }
    }

    return qb.getMany();
  }

  async create(dto: CreateScheduleDto): Promise<Schedule> {
    const entity = this.repo.create({
      date: dto.date,
      time: dto.time,
      text: dto.text,
      customerId: dto.customerId ?? null,
      customerName: dto.customerName ?? null,
      customerRegion: dto.customerRegion ?? null,
    });
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Schedule #${id} not found`);
    }
    await this.repo.remove(entity);
  }
}
