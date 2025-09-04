import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../category/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  originalPrice: number; // For discount calculation

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 0 })
  views: number; // For most viewed products

  @Column({ default: 0 })
  sales: number; // For best selling products

  @Column({ default: 0 })
  rating: number; // Average rating

  @Column({ default: 0 })
  reviewCount: number;

  @Column('simple-array', { nullable: true })
  images: string[]; // Array of image URLs

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isNew: boolean; // For newest products

  @Column({ default: false })
  isOnSale: boolean; // For promotional products

  @Column({ nullable: true })
  tags: string; // JSON string of tags

  @Column({ nullable: true })
  specifications: string; // JSON string of specifications

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
