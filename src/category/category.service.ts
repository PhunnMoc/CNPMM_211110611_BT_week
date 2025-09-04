import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<Category> {
    return this.categoryRepository.findOne({ 
      where: { id },
      relations: ['products']
    });
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    const category = this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(category);
  }

  async update(id: number, categoryData: Partial<Category>): Promise<Category> {
    await this.categoryRepository.update(id, categoryData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }

  // Initialize mock data
  async initializeMockData(): Promise<void> {
    const existingCategories = await this.categoryRepository.count();
    if (existingCategories > 0) {
      return; // Data already exists
    }

    const mockCategoryData = [
      {
        name: 'Basic Filters',
        description: 'Essential photo editing filters for beginners',
        image: '/images/categories/basic-filters.jpg',
      },
      {
        name: 'Advanced Effects',
        description: 'Professional-grade effects and filters',
        image: '/images/categories/advanced-effects.jpg',
      },
      {
        name: 'Color Grading',
        description: 'Professional color correction and grading tools',
        image: '/images/categories/color-grading.jpg',
      },
      {
        name: 'Creative Filters',
        description: 'Artistic and creative photo effects',
        image: '/images/categories/creative-filters.jpg',
      },
      {
        name: 'Vintage Styles',
        description: 'Retro and vintage photo effects',
        image: '/images/categories/vintage-styles.jpg',
      },
      {
        name: 'Black & White',
        description: 'Monochrome and B&W conversion tools',
        image: '/images/categories/black-white.jpg',
      },
    ];

    for (const data of mockCategoryData) {
      await this.create(data);
    }
  }
}
