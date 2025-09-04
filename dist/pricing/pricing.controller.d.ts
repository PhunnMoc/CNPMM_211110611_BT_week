import { PricingService } from './pricing.service';
import { Pricing } from './pricing.entity';
export declare class PricingController {
    private readonly pricingService;
    constructor(pricingService: PricingService);
    findAll(): Promise<Pricing[]>;
    findById(id: number): Promise<Pricing>;
    create(pricingData: Partial<Pricing>): Promise<Pricing>;
    update(id: number, pricingData: Partial<Pricing>): Promise<Pricing>;
    delete(id: number): Promise<void>;
    initializeMockData(): Promise<{
        message: string;
    }>;
}
