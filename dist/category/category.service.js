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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./category.entity");
let CategoryService = class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async findAll() {
        return this.categoryRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }
    async findById(id) {
        return this.categoryRepository.findOne({
            where: { id },
            relations: ['products']
        });
    }
    async create(categoryData) {
        const category = this.categoryRepository.create(categoryData);
        return this.categoryRepository.save(category);
    }
    async update(id, categoryData) {
        await this.categoryRepository.update(id, categoryData);
        return this.findById(id);
    }
    async delete(id) {
        await this.categoryRepository.delete(id);
    }
    async initializeMockData() {
        const existingCategories = await this.categoryRepository.count();
        if (existingCategories > 0) {
            return;
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
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryService);
//# sourceMappingURL=category.service.js.map