import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingSource } from '../entities/landing-source.entity';
import { LandingMapping } from '../entities/landing-mapping.entity';

@Injectable()
export class LandingService {
  constructor(
    @InjectRepository(LandingSource)
    private readonly landingSourceRepo: Repository<LandingSource>,
    @InjectRepository(LandingMapping)
    private readonly landingMappingRepo: Repository<LandingMapping>,
  ) {}

  // Landing Sources
  async getLandingSources(): Promise<LandingSource[]> {
    return this.landingSourceRepo.find({ order: { id: 'DESC' } });
  }

  async createLandingSource(dto: Partial<LandingSource>): Promise<LandingSource> {
    const entity = this.landingSourceRepo.create(dto);
    return this.landingSourceRepo.save(entity);
  }

  async updateLandingSource(
    id: number,
    dto: Partial<LandingSource>,
  ): Promise<LandingSource | null> {
    await this.landingSourceRepo.update(id, dto);
    return this.landingSourceRepo.findOne({ where: { id } });
  }

  async deleteLandingSource(id: number): Promise<{ success: boolean }> {
    await this.landingSourceRepo.delete(id);
    return { success: true };
  }

  // Landing Mappings
  async getLandingMappings(): Promise<LandingMapping[]> {
    return this.landingMappingRepo.find({ order: { id: 'DESC' } });
  }

  async createLandingMapping(dto: Partial<LandingMapping>): Promise<LandingMapping> {
    const entity = this.landingMappingRepo.create(dto);
    return this.landingMappingRepo.save(entity);
  }

  async updateLandingMapping(
    id: number,
    dto: Partial<LandingMapping>,
  ): Promise<LandingMapping | null> {
    await this.landingMappingRepo.update(id, dto);
    return this.landingMappingRepo.findOne({ where: { id } });
  }

  async deleteLandingMapping(id: number): Promise<{ success: boolean }> {
    await this.landingMappingRepo.delete(id);
    return { success: true };
  }
}
