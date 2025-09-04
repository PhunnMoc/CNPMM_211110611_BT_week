import { Repository } from 'typeorm';
import { Pricing } from './pricing.entity';
export declare class PricingService {
    private pricingRepository;
    constructor(pricingRepository: Repository<Pricing>);
    findAll(): Promise<Pricing[]>;
    findById(id: number): Promise<Pricing>;
    create(pricingData: Partial<Pricing>): Promise<Pricing>;
    update(id: number, pricingData: Partial<Pricing>): Promise<Pricing>;
    delete(id: number): Promise<void>;
    initializeMockData(): Promise<void>;
}
