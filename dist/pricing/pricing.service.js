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
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pricing_entity_1 = require("./pricing.entity");
let PricingService = class PricingService {
    constructor(pricingRepository) {
        this.pricingRepository = pricingRepository;
    }
    async findAll() {
        const existingPricing = await this.pricingRepository.count();
        if (existingPricing === 0) {
            await this.initializeMockData();
        }
        return this.pricingRepository.find({
            where: { isActive: true },
            order: { price: 'ASC' },
        });
    }
    async findById(id) {
        return this.pricingRepository.findOne({ where: { id } });
    }
    async create(pricingData) {
        const pricing = this.pricingRepository.create(pricingData);
        return this.pricingRepository.save(pricing);
    }
    async update(id, pricingData) {
        await this.pricingRepository.update(id, pricingData);
        return this.findById(id);
    }
    async delete(id) {
        await this.pricingRepository.delete(id);
    }
    async initializeMockData() {
        const existingPricing = await this.pricingRepository.count();
        if (existingPricing > 0) {
            return;
        }
        const mockPricingData = [
            {
                name: 'Basic',
                price: 9.99,
                description: 'Perfect for beginners and casual users',
                features: JSON.stringify([
                    'Up to 10 photos per month',
                    'Basic filters and effects',
                    'Standard resolution export',
                    'Email support'
                ]),
                duration: 1,
                isPopular: false,
            },
            {
                name: 'Pro',
                price: 19.99,
                description: 'Ideal for professionals and content creators',
                features: JSON.stringify([
                    'Unlimited photos',
                    'Advanced filters and effects',
                    'High resolution export',
                    'Batch processing',
                    'Priority support',
                    'Cloud storage (5GB)'
                ]),
                duration: 1,
                isPopular: true,
            },
            {
                name: 'Enterprise',
                price: 49.99,
                description: 'For teams and businesses with advanced needs',
                features: JSON.stringify([
                    'Everything in Pro',
                    'Team collaboration',
                    'API access',
                    'Custom branding',
                    'Advanced analytics',
                    'Cloud storage (50GB)',
                    '24/7 phone support',
                    'Custom integrations'
                ]),
                duration: 1,
                isPopular: false,
            },
            {
                name: 'Lifetime',
                price: 299.99,
                description: 'One-time payment for lifetime access',
                features: JSON.stringify([
                    'Everything in Pro',
                    'Lifetime updates',
                    'No monthly fees',
                    'Premium support',
                    'Cloud storage (10GB)',
                    'Early access to new features'
                ]),
                duration: 0,
                isPopular: false,
            },
        ];
        for (const data of mockPricingData) {
            await this.create(data);
        }
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pricing_entity_1.Pricing)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PricingService);
//# sourceMappingURL=pricing.service.js.map