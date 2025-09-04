import { Category } from '../category/category.entity';
export declare class Product {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    stock: number;
    views: number;
    sales: number;
    rating: number;
    reviewCount: number;
    images: string[];
    isActive: boolean;
    isNew: boolean;
    isOnSale: boolean;
    tags: string;
    specifications: string;
    category: Category;
    categoryId: number;
    createdAt: Date;
    updatedAt: Date;
}
