import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from '../entities/service.entity';
import { Salesperson } from '../entities/salesperson.entity';
import { Company } from '../entities/company.entity';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(ServiceEntity)
    private serviceRepo: Repository<ServiceEntity>,
    @InjectRepository(Salesperson)
    private salespersonRepo: Repository<Salesperson>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {}

  // --- Services ---
  getServices() {
    return this.serviceRepo.find({ order: { createdAt: 'DESC' } });
  }

  createService(dto: { name: string; identifier: string }) {
    const entity = this.serviceRepo.create(dto);
    return this.serviceRepo.save(entity);
  }

  async toggleService(id: number) {
    const entity = await this.serviceRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Service ${id} not found`);
    entity.active = !entity.active;
    return this.serviceRepo.save(entity);
  }

  async deleteService(id: number) {
    const entity = await this.serviceRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Service ${id} not found`);
    return this.serviceRepo.remove(entity);
  }

  // --- Salespersons ---
  getSalespersons() {
    return this.salespersonRepo.find({ order: { createdAt: 'DESC' } });
  }

  createSalesperson(dto: { name: string; identifier: string }) {
    const entity = this.salespersonRepo.create(dto);
    return this.salespersonRepo.save(entity);
  }

  async toggleSalesperson(id: number) {
    const entity = await this.salespersonRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Salesperson ${id} not found`);
    entity.active = !entity.active;
    return this.salespersonRepo.save(entity);
  }

  async deleteSalesperson(id: number) {
    const entity = await this.salespersonRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Salesperson ${id} not found`);
    return this.salespersonRepo.remove(entity);
  }

  // --- Companies ---
  getCompanies() {
    return this.companyRepo.find({ order: { createdAt: 'DESC' } });
  }

  createCompany(dto: { name: string; identifier: string }) {
    const entity = this.companyRepo.create(dto);
    return this.companyRepo.save(entity);
  }

  async toggleCompany(id: number) {
    const entity = await this.companyRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Company ${id} not found`);
    entity.active = !entity.active;
    return this.companyRepo.save(entity);
  }

  async deleteCompany(id: number) {
    const entity = await this.companyRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Company ${id} not found`);
    return this.companyRepo.remove(entity);
  }
}
