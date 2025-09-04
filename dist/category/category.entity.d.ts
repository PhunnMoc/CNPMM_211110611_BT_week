import { Product } from '../product/product.entity';
export declare class Category {
    id: number;
    name: string;
    description: string;
    image: string;
    isActive: boolean;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
}
