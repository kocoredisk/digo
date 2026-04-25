import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly repo: Repository<Tag>,
  ) {}

  async findAll(): Promise<{ success: boolean; tags: Tag[] }> {
    const tags = await this.repo.find({ order: { name: 'ASC' } });
    return { success: true, tags };
  }

  async create(name: string): Promise<Tag> {
    const existing = await this.repo.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException(`Tag "${name}" already exists`);
    }
    const entity = this.repo.create({ id: randomUUID(), name });
    return this.repo.save(entity);
  }

  async update(id: string, name: string): Promise<Tag> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Tag #${id} not found`);
    }
    const duplicate = await this.repo.findOne({ where: { name } });
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException(`Tag "${name}" already exists`);
    }
    entity.name = name;
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Tag #${id} not found`);
    }
    await this.repo.remove(entity);
  }
}
