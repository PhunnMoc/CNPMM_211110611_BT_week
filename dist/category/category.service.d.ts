import { Repository } from 'typeorm';
import { Category } from './category.entity';
export declare class CategoryService {
    private categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    findAll(): Promise<Category[]>;
    findById(id: number): Promise<Category>;
    create(categoryData: Partial<Category>): Promise<Category>;
    update(id: number, categoryData: Partial<Category>): Promise<Category>;
    delete(id: number): Promise<void>;
    initializeMockData(): Promise<void>;
}
