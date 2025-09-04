import { ProductService } from './product.service';
import { Product } from './product.entity';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    findAll(page?: number, limit?: number): Promise<{
        products: Product[];
        total: number;
        totalPages: number;
    }>;
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
    findById(id: number): Promise<Product>;
    create(productData: Partial<Product>): Promise<Product>;
    update(id: number, productData: Partial<Product>): Promise<Product>;
    updateStock(id: number, quantity: number): Promise<Product>;
    delete(id: number): Promise<void>;
    initializeMockData(): Promise<{
        message: string;
    }>;
}
