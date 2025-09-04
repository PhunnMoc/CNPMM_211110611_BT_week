import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CategoryService } from '../category/category.service';
export declare class ProductService {
    private productRepository;
    private categoryService;
    constructor(productRepository: Repository<Product>, categoryService: CategoryService);
    findAll(page?: number, limit?: number): Promise<{
        products: Product[];
        total: number;
        totalPages: number;
    }>;
    findById(id: number): Promise<Product>;
    getNewestProducts(limit?: number): Promise<Product[]>;
    getBestSellingProducts(limit?: number): Promise<Product[]>;
    getMostViewedProducts(limit?: number): Promise<Product[]>;
    getPromotionalProducts(limit?: number): Promise<Product[]>;
    getProductsByCategory(categoryId: number, page?: number, limit?: number): Promise<{
        products: Product[];
        total: number;
        totalPages: number;
    }>;
    searchProducts(query: string, page?: number, limit?: number): Promise<{
        products: Product[];
        total: number;
        totalPages: number;
    }>;
    create(productData: Partial<Product>): Promise<Product>;
    update(id: number, productData: Partial<Product>): Promise<Product>;
    delete(id: number): Promise<void>;
    updateStock(id: number, quantity: number): Promise<Product>;
    initializeMockData(): Promise<void>;
}
