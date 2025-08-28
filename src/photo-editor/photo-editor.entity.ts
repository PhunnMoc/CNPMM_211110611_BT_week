import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('photo_edits')
export class PhotoEdit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalFileName: string;

  @Column()
  editedFileName: string;

  @Column()
  originalPath: string;

  @Column()
  editedPath: string;

  @Column('json', { nullable: true })
  editSettings: any;

  @Column({ default: false })
  isPublic: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
