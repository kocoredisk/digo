import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Application } from '../entities/application.entity';

interface FindAllQuery {
  service_type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface CreateDto {
  service_type: string;
  bizNm: string;
  userNm: string;
  email: string;
  phone: string;
  content?: string;
  sales_person: string;
  sales_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  source?: string;
  referrer?: string;
  regDate?: string;
  status?: string;
}

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private appRepo: Repository<Application>,
  ) {}

  async findAll(query: FindAllQuery) {
    const { service_type, status, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    const where: FindOptionsWhere<Application> = {};
    if (service_type) where.serviceType = service_type;
    if (status) where.status = status;

    const [data, total] = await this.appRepo.findAndCount({
      where,
      skip: offset,
      take: limit,
      order: { regDate: 'DESC' },
    });

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  create(dto: CreateDto) {
    const today = new Date();
    const regDate =
      dto.regDate ||
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const entity = this.appRepo.create({
      serviceType: dto.service_type,
      bizNm: dto.bizNm,
      userNm: dto.userNm,
      email: dto.email,
      phone: dto.phone ? dto.phone.replace(/-/g, '') : dto.phone,
      content: dto.content ?? null,
      status: dto.status ?? 'pending',
      salesPerson: dto.sales_person,
      salesCode: dto.sales_code ?? null,
      utmSource: dto.utm_source ?? null,
      utmMedium: dto.utm_medium ?? null,
      utmCampaign: dto.utm_campaign ?? null,
      utmTerm: dto.utm_term ?? null,
      utmContent: dto.utm_content ?? null,
      source: dto.source ?? null,
      referrer: dto.referrer ?? null,
      regDate,
    });
    return this.appRepo.save(entity);
  }

  async update(id: number, dto: Partial<CreateDto>) {
    const entity = await this.appRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Application ${id} not found`);

    if (dto.service_type !== undefined) entity.serviceType = dto.service_type;
    if (dto.bizNm !== undefined) entity.bizNm = dto.bizNm;
    if (dto.userNm !== undefined) entity.userNm = dto.userNm;
    if (dto.email !== undefined) entity.email = dto.email;
    if (dto.phone !== undefined)
      entity.phone = dto.phone.replace(/-/g, '');
    if (dto.content !== undefined) entity.content = dto.content ?? null;
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.sales_person !== undefined) entity.salesPerson = dto.sales_person;
    if (dto.sales_code !== undefined) entity.salesCode = dto.sales_code ?? null;
    if (dto.utm_source !== undefined) entity.utmSource = dto.utm_source ?? null;
    if (dto.utm_medium !== undefined) entity.utmMedium = dto.utm_medium ?? null;
    if (dto.utm_campaign !== undefined)
      entity.utmCampaign = dto.utm_campaign ?? null;
    if (dto.utm_term !== undefined) entity.utmTerm = dto.utm_term ?? null;
    if (dto.utm_content !== undefined)
      entity.utmContent = dto.utm_content ?? null;
    if (dto.source !== undefined) entity.source = dto.source ?? null;
    if (dto.referrer !== undefined) entity.referrer = dto.referrer ?? null;
    if (dto.regDate !== undefined) entity.regDate = dto.regDate;

    return this.appRepo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.appRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Application ${id} not found`);
    return this.appRepo.remove(entity);
  }
}
