import { CategoryService } from './category.service';
import { Category } from './category.entity';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    findAll(): Promise<Category[]>;
    findById(id: number): Promise<Category>;
    create(categoryData: Partial<Category>): Promise<Category>;
    update(id: number, categoryData: Partial<Category>): Promise<Category>;
    delete(id: number): Promise<void>;
    initializeMockData(): Promise<{
        message: string;
    }>;
}
