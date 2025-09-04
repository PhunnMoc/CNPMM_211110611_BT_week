import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ) {
    return this.productService.findAll(page, limit);
  }

  @Get('newest')
  async getNewestProducts(@Query('limit') limit: number = 8) {
    return this.productService.getNewestProducts(limit);
  }

  @Get('best-selling')
  async getBestSellingProducts(@Query('limit') limit: number = 6) {
    return this.productService.getBestSellingProducts(limit);
  }

  @Get('most-viewed')
  async getMostViewedProducts(@Query('limit') limit: number = 8) {
    return this.productService.getMostViewedProducts(limit);
  }

  @Get('promotional')
  async getPromotionalProducts(@Query('limit') limit: number = 4) {
    return this.productService.getPromotionalProducts(limit);
  }

  @Get('category/:categoryId')
  async getProductsByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ) {
    return this.productService.getProductsByCategory(categoryId, page, limit);
  }

  @Get('search')
  async searchProducts(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ) {
    return this.productService.searchProducts(query, page, limit);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findById(id);
  }

  @Post()
  async create(@Body() productData: Partial<Product>) {
    return this.productService.create(productData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() productData: Partial<Product>,
  ) {
    return this.productService.update(id, productData);
  }

  @Put(':id/stock')
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
  ) {
    return this.productService.updateStock(id, quantity);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }

  @Post('init-mock-data')
  async initializeMockData() {
    await this.productService.initializeMockData();
    return { message: 'Mock data initialized successfully' };
  }
}
