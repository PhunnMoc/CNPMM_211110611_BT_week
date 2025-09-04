import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pricing } from './pricing.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Pricing)
    private pricingRepository: Repository<Pricing>,
  ) {}

  async findAll(): Promise<Pricing[]> {
    const existingPricing = await this.pricingRepository.count();
    if (existingPricing === 0) {
      // Auto-initialize mock data if no data exists
      await this.initializeMockData();
    }
    
    return this.pricingRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  async findById(id: number): Promise<Pricing> {
    return this.pricingRepository.findOne({ where: { id } });
  }

  async create(pricingData: Partial<Pricing>): Promise<Pricing> {
    const pricing = this.pricingRepository.create(pricingData);
    return this.pricingRepository.save(pricing);
  }

  async update(id: number, pricingData: Partial<Pricing>): Promise<Pricing> {
    await this.pricingRepository.update(id, pricingData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.pricingRepository.delete(id);
  }

  // Initialize mock data
  async initializeMockData(): Promise<void> {
    const existingPricing = await this.pricingRepository.count();
    if (existingPricing > 0) {
      return; // Data already exists
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
        duration: 0, // 0 means lifetime
        isPopular: false,
      },
    ];

    for (const data of mockPricingData) {
      await this.create(data);
    }
  }
}
