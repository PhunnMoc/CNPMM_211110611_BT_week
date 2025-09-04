import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { Pricing } from './pricing.entity';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  async findAll(): Promise<Pricing[]> {
    return this.pricingService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Pricing> {
    return this.pricingService.findById(id);
  }

  @Post()
  async create(@Body() pricingData: Partial<Pricing>): Promise<Pricing> {
    return this.pricingService.create(pricingData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() pricingData: Partial<Pricing>,
  ): Promise<Pricing> {
    return this.pricingService.update(id, pricingData);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pricingService.delete(id);
  }

  @Post('init-mock-data')
  async initializeMockData(): Promise<{ message: string }> {
    await this.pricingService.initializeMockData();
    return { message: 'Mock data initialized successfully' };
  }
}
