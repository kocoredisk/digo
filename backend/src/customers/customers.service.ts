import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Customer } from '../entities/customer.entity';

const CATEGORY_PREFIX: Record<string, string> = {
  '경리': 'A',
  '세무사': 'T',
  '노무사': 'W',
  '스타트업': 'S',
  'manual': 'M',
};

function buildSn(category: string, id: number): string {
  const prefix = CATEGORY_PREFIX[category] ?? 'M';
  return `${prefix}${String(id).padStart(5, '0')}`;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  async findAll(query: { startDate?: string; endDate?: string; category?: string }): Promise<Customer[]> {
    const qb = this.repo.createQueryBuilder('c');

    if (query.startDate) {
      qb.andWhere('c.created_at >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('c.created_at <= :endDate', { endDate: query.endDate + ' 23:59:59' });
    }
    if (query.category) {
      qb.andWhere('c.category = :category', { category: query.category });
    }

    return qb.orderBy('c.id', 'DESC').getMany();
  }

  async findAllWithTags(query: { startDate?: string; endDate?: string }): Promise<Customer[]> {
    const qb = this.repo.createQueryBuilder('c').where('c.tags IS NOT NULL');

    if (query.startDate) {
      qb.andWhere('c.created_at >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('c.created_at <= :endDate', { endDate: query.endDate + ' 23:59:59' });
    }

    return qb.orderBy('c.id', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.repo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    return customer;
  }

  async create(dto: Partial<Customer>): Promise<Customer> {
    const entity = this.repo.create(dto);
    const saved = await this.repo.save(entity);

    // SN 자동 생성
    const category = saved.category ?? 'manual';
    saved.sn = buildSn(category, saved.id);
    return this.repo.save(saved);
  }

  async update(id: number, dto: Partial<Customer>): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.repo.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.repo.remove(customer);
  }

  async excludeCustomer(id: number): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.isExcluded = 1;
    return this.repo.save(customer);
  }

  async bulkExclude(ids: number[]): Promise<void> {
    await this.repo.update({ id: In(ids) }, { isExcluded: 1 });
  }

  async changeCategory(customerIds: number[], category: string): Promise<void> {
    await this.repo.update({ id: In(customerIds) }, { category });
  }

  async bulkUpdateTags(customers: Array<{ customerId: number; tags: string }>): Promise<void> {
    await Promise.all(
      customers.map(({ customerId, tags }) =>
        this.repo.update({ id: customerId }, { tags }),
      ),
    );
  }
}
