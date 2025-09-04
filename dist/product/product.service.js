"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
const category_service_1 = require("../category/category.service");
let ProductService = class ProductService {
    constructor(productRepository, categoryService) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
    }
    async findAll(page = 1, limit = 12) {
        const [products, total] = await this.productRepository.findAndCount({
            where: { isActive: true },
            relations: ['category'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            products,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category'],
        });
        if (product) {
            await this.productRepository.update(id, { views: product.views + 1 });
            product.views += 1;
        }
        return product;
    }
    async getNewestProducts(limit = 8) {
        return this.productRepository.find({
            where: { isActive: true, isNew: true },
            relations: ['category'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getBestSellingProducts(limit = 6) {
        return this.productRepository.find({
            where: { isActive: true },
            relations: ['category'],
            order: { sales: 'DESC' },
            take: limit,
        });
    }
    async getMostViewedProducts(limit = 8) {
        return this.productRepository.find({
            where: { isActive: true },
            relations: ['category'],
            order: { views: 'DESC' },
            take: limit,
        });
    }
    async getPromotionalProducts(limit = 4) {
        return this.productRepository.find({
            where: { isActive: true, isOnSale: true },
            relations: ['category'],
            order: {
                originalPrice: 'ASC'
            },
            take: limit,
        });
    }
    async getProductsByCategory(categoryId, page = 1, limit = 12) {
        const [products, total] = await this.productRepository.findAndCount({
            where: { isActive: true, categoryId },
            relations: ['category'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            products,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
    async searchProducts(query, page = 1, limit = 12) {
        const [products, total] = await this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.isActive = :isActive', { isActive: true })
            .andWhere('(product.name LIKE :query OR product.description LIKE :query)', { query: `%${query}%` })
            .orderBy('product.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            products,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
    async create(productData) {
        const product = this.productRepository.create(productData);
        return this.productRepository.save(product);
    }
    async update(id, productData) {
        await this.productRepository.update(id, productData);
        return this.findById(id);
    }
    async delete(id) {
        await this.productRepository.delete(id);
    }
    async updateStock(id, quantity) {
        const product = await this.findById(id);
        if (product) {
            await this.productRepository.update(id, { stock: product.stock + quantity });
            return this.findById(id);
        }
        return null;
    }
    async initializeMockData() {
        const existingProducts = await this.productRepository.count();
        if (existingProducts > 0) {
            return;
        }
        await this.categoryService.initializeMockData();
        const categories = await this.categoryService.findAll();
        const mockProductData = [
            {
                name: 'Vintage Sepia Filter',
                description: 'Add a warm, nostalgic sepia tone to your photos with this classic filter.',
                price: 4.99,
                originalPrice: 7.99,
                stock: 50,
                views: 1250,
                sales: 89,
                rating: 4.5,
                reviewCount: 23,
                images: ['/images/products/sepia-1.jpg', '/images/products/sepia-2.jpg'],
                isNew: true,
                isOnSale: true,
                tags: JSON.stringify(['vintage', 'sepia', 'warm', 'nostalgic']),
                specifications: JSON.stringify({
                    'Effect Type': 'Color Tone',
                    'Compatibility': 'All Image Formats',
                    'Processing Speed': 'Fast'
                }),
                categoryId: categories[0].id,
            },
            {
                name: 'Black & White Classic',
                description: 'Convert your photos to stunning black and white with professional contrast.',
                price: 3.99,
                originalPrice: null,
                stock: 75,
                views: 2100,
                sales: 156,
                rating: 4.7,
                reviewCount: 45,
                images: ['/images/products/bw-1.jpg', '/images/products/bw-2.jpg'],
                isNew: false,
                isOnSale: false,
                tags: JSON.stringify(['black-white', 'monochrome', 'classic', 'contrast']),
                specifications: JSON.stringify({
                    'Effect Type': 'Monochrome',
                    'Compatibility': 'All Image Formats',
                    'Processing Speed': 'Fast'
                }),
                categoryId: categories[5].id,
            },
            {
                name: 'Brightness Enhancer',
                description: 'Automatically enhance brightness and exposure for perfect lighting.',
                price: 2.99,
                originalPrice: 4.99,
                stock: 100,
                views: 1800,
                sales: 203,
                rating: 4.3,
                reviewCount: 67,
                images: ['/images/products/brightness-1.jpg'],
                isNew: true,
                isOnSale: true,
                tags: JSON.stringify(['brightness', 'exposure', 'lighting', 'auto']),
                specifications: JSON.stringify({
                    'Effect Type': 'Lighting',
                    'Compatibility': 'All Image Formats',
                    'Processing Speed': 'Fast'
                }),
                categoryId: categories[0].id,
            },
            {
                name: 'HDR Pro Effect',
                description: 'Create stunning HDR effects with advanced tone mapping technology.',
                price: 12.99,
                originalPrice: 19.99,
                stock: 25,
                views: 950,
                sales: 34,
                rating: 4.8,
                reviewCount: 12,
                images: ['/images/products/hdr-1.jpg', '/images/products/hdr-2.jpg', '/images/products/hdr-3.jpg'],
                isNew: false,
                isOnSale: true,
                tags: JSON.stringify(['hdr', 'tone-mapping', 'professional', 'advanced']),
                specifications: JSON.stringify({
                    'Effect Type': 'HDR Processing',
                    'Compatibility': 'High Resolution Images',
                    'Processing Speed': 'Medium'
                }),
                categoryId: categories[1].id,
            },
            {
                name: 'Motion Blur Artist',
                description: 'Add artistic motion blur effects to create dynamic, flowing images.',
                price: 8.99,
                originalPrice: null,
                stock: 40,
                views: 750,
                sales: 28,
                rating: 4.4,
                reviewCount: 19,
                images: ['/images/products/motion-blur-1.jpg'],
                isNew: true,
                isOnSale: false,
                tags: JSON.stringify(['motion-blur', 'artistic', 'dynamic', 'flowing']),
                specifications: JSON.stringify({
                    'Effect Type': 'Motion Blur',
                    'Compatibility': 'All Image Formats',
                    'Processing Speed': 'Medium'
                }),
                categoryId: categories[1].id,
            },
            {
                name: 'Cinematic Color Grade',
                description: 'Professional color grading for cinematic, movie-like appearance.',
                price: 15.99,
                originalPrice: 24.99,
                stock: 15,
                views: 1200,
                sales: 45,
                rating: 4.9,
                reviewCount: 8,
                images: ['/images/products/cinematic-1.jpg', '/images/products/cinematic-2.jpg'],
                isNew: false,
                isOnSale: true,
                tags: JSON.stringify(['cinematic', 'color-grading', 'professional', 'movie']),
                specifications: JSON.stringify({
                    'Effect Type': 'Color Grading',
                    'Compatibility': 'High Resolution Images',
                    'Processing Speed': 'Medium'
                }),
                categoryId: categories[2].id,
            },
            {
                name: 'Warm Sunset Tones',
                description: 'Add beautiful warm sunset colors to your photos.',
                price: 6.99,
                originalPrice: null,
                stock: 60,
                views: 1600,
                sales: 78,
                rating: 4.6,
                reviewCount: 34,
                images: ['/images/products/sunset-1.jpg'],
                isNew: true,
                isOnSale: false,
                tags: JSON.stringify(['sunset', 'warm', 'golden-hour', 'colors']),
                specifications: JSON.stringify({
                    'Effect Type': 'Color Enhancement',
                    'Compatibility': 'All Image Formats',
                    'Processing Speed': 'Fast'
                }),
                categoryId: categories[2].id,
            },
            {
                name: 'Oil Painting Effect',
                description: 'Transform your photos into beautiful oil paintings.',
                price: 9.99,
                originalPrice: 14.99,
                stock: 30,
                views: 1100,
                sales: 52,
                rating: 4.7,
                reviewCount: 25,
                images: ['/images/products/oil-painting-1.jpg', '/images/products/oil-painting-2.jpg'],
                isNew: false,
                isOnSale: true,
                tags: JSON.stringify(['oil-painting', 'artistic', 'creative', 'painting']),
                specifications: JSON.stringify({
                    'Effect Type': 'Artistic',
                    'Compatibility': 'All Image Formats',
                    'Processing Speed': 'Slow'
                }),
                categoryId: categories[3].id,
            },
            {
                name: 'Watercolor Dreams',
                description: 'Create dreamy watercolor effects from your photos.',
                price: 7.99,
                originalPrice: null,
                stock: 45,
                views: 900,
                sales: 41,
                rating: 4.5,
                reviewCount: 18,
                images: ['/images/products/watercolor-1.jpg'],
                isNew: true,
                isOnSale: false,
                tags: JSON.stringify(['watercolor', 'dreamy', 'artistic', 'soft']),
                specifications: JSON.stringify({
                    'Effect Type': 'Artistic',
                    'Compatibility': 'All Image Formats',
                    'Processing Speed': 'Medium'
                }),
                categoryId: categories[3].id,
            },
            {
                name: '1970s Film Grain',
                description: 'Add authentic 1970s film grain and color grading.',
                price: 5.99,
                originalPrice: 8.99,
                stock: 55,
                views: 1400,
                sales: 67,
                rating: 4.4,
                reviewCount: 29,
                images: ['/images/products/70s-film-1.jpg'],
                isNew: false,
                isOnSale: true,
                tags: JSON.stringify(['1970s', 'film-grain', 'vintage', 'retro']),
                specifications: JSON.stringify({
                    'Effect Type': 'Vintage',
                    'Compatibility': 'All Image Formats',
                    'Processing Speed': 'Fast'
                }),
                categoryId: categories[4].id,
            },
            {
                name: 'Polaroid Instant',
                description: 'Recreate the classic Polaroid instant photo look.',
                price: 4.99,
                originalPrice: null,
                stock: 80,
                views: 1900,
                sales: 134,
                rating: 4.6,
                reviewCount: 56,
                images: ['/images/products/polaroid-1.jpg'],
                isNew: true,
                isOnSale: false,
                tags: JSON.stringify(['polaroid', 'instant', 'vintage', 'classic']),
                specifications: JSON.stringify({
                    'Effect Type': 'Vintage',
                    'Compatibility': 'All Image Formats',
                    'Processing Speed': 'Fast'
                }),
                categoryId: categories[4].id,
            },
            {
                name: 'Film Noir Classic',
                description: 'Create dramatic film noir style with high contrast and shadows.',
                price: 6.99,
                originalPrice: 9.99,
                stock: 35,
                views: 800,
                sales: 23,
                rating: 4.8,
                reviewCount: 15,
                images: ['/images/products/film-noir-1.jpg'],
                isNew: false,
                isOnSale: true,
                tags: JSON.stringify(['film-noir', 'dramatic', 'contrast', 'shadows']),
                specifications: JSON.stringify({
                    'Effect Type': 'Vintage',
                    'Compatibility': 'All Image Formats',
                    'Processing Speed': 'Fast'
                }),
                categoryId: categories[4].id,
            },
        ];
        for (const data of mockProductData) {
            await this.create(data);
        }
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        category_service_1.CategoryService])
], ProductService);
//# sourceMappingURL=product.service.js.map