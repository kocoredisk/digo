import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ConsultationApplication } from '../entities/consultation.entity';

export interface FindAllQuery {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CreateConsultationDto {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  serviceType?: string;
  source?: string;
  status?: string;
  notes?: string;
}

export interface UpdateConsultationDto {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  serviceType?: string;
  source?: string;
  status?: string;
  notes?: string;
}

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(ConsultationApplication)
    private readonly repo: Repository<ConsultationApplication>,
  ) {}

  async findAll(query: FindAllQuery): Promise<ConsultationApplication[]> {
    const qb: SelectQueryBuilder<ConsultationApplication> = this.repo
      .createQueryBuilder('c')
      .orderBy('c.created_at', 'DESC');

    if (query.status) {
      qb.andWhere('c.status = :status', { status: query.status });
    }

    if (query.startDate) {
      qb.andWhere('c.created_at >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }

    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('c.created_at <= :endDate', { endDate: end });
    }

    if (query.search) {
      qb.andWhere(
        '(c.name ILIKE :search OR c.phone ILIKE :search OR c.email ILIKE :search OR c.company ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return qb.getMany();
  }

  async create(dto: CreateConsultationDto): Promise<ConsultationApplication> {
    const entity = this.repo.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email ?? null,
      company: dto.company ?? null,
      serviceType: dto.serviceType ?? null,
      source: dto.source ?? null,
      status: dto.status ?? 'new',
      notes: dto.notes ?? null,
    });
    return this.repo.save(entity);
  }

  async update(
    id: number,
    dto: UpdateConsultationDto,
  ): Promise<ConsultationApplication> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Consultation #${id} not found`);
    }
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Consultation #${id} not found`);
    }
    await this.repo.remove(entity);
  }
}
