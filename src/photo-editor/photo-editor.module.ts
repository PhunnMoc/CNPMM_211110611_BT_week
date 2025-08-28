import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { PhotoEditorController } from './photo-editor.controller';
import { PhotoEditorService } from './photo-editor.service';
import { PhotoEdit } from './photo-editor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PhotoEdit]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [PhotoEditorController],
  providers: [PhotoEditorService],
})
export class PhotoEditorModule {}
