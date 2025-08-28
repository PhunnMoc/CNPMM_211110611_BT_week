import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoEdit } from './photo-editor.entity';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class PhotoEditorService {
  constructor(
    @InjectRepository(PhotoEdit)
    private photoEditRepository: Repository<PhotoEdit>,
  ) {
    // Create upload directories if they don't exist
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs = ['uploads', 'uploads/original', 'uploads/edited'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async uploadImage(file: Express.Multer.File, userId: number): Promise<PhotoEdit> {
    const fileName = `${randomUUID()}-${file.originalname}`;
    const filePath = path.join('uploads', 'original', fileName);
    
    fs.writeFileSync(filePath, file.buffer);

    const photoEdit = this.photoEditRepository.create({
      originalFileName: file.originalname,
      editedFileName: fileName,
      originalPath: filePath,
      editedPath: filePath, // Initially same as original
      userId,
    });

    return this.photoEditRepository.save(photoEdit);
  }

  async applyFilters(photoId: number, filters: any, userId: number): Promise<PhotoEdit> {
    const photoEdit = await this.photoEditRepository.findOne({
      where: { id: photoId, userId },
    });

    if (!photoEdit) {
      throw new NotFoundException('Photo not found');
    }

    let image = sharp(photoEdit.originalPath);

    // Apply brightness
    if (filters.brightness) {
      image = image.modulate({ brightness: filters.brightness });
    }

    // Apply contrast
    if (filters.contrast) {
      image = image.modulate({ saturation: filters.contrast });
    }

    // Apply saturation
    if (filters.saturation) {
      image = image.modulate({ saturation: filters.saturation });
    }

    // Apply blur
    if (filters.blur) {
      image = image.blur(filters.blur);
    }

    // Apply sharpen
    if (filters.sharpen) {
      image = image.sharpen(filters.sharpen);
    }

    // Apply grayscale
    if (filters.grayscale) {
      image = image.grayscale();
    }

    // Apply sepia
    if (filters.sepia) {
      image = image.modulate({
        hue: 30,
        saturation: 0.5,
      });
    }

    // Apply rotation
    if (filters.rotation) {
      image = image.rotate(filters.rotation);
    }

    // Apply flip
    if (filters.flip) {
      image = image.flip();
    }

    // Apply flop (horizontal flip)
    if (filters.flop) {
      image = image.flop();
    }

    // Apply resize
    if (filters.width || filters.height) {
      image = image.resize(filters.width, filters.height, {
        fit: filters.fit || 'cover',
      });
    }

    // Apply crop
    if (filters.crop) {
      image = image.extract({
        left: filters.crop.left,
        top: filters.crop.top,
        width: filters.crop.width,
        height: filters.crop.height,
      });
    }

    // Generate edited file path
    const editedFileName = `edited-${randomUUID()}.jpg`;
    const editedPath = path.join('uploads', 'edited', editedFileName);

    // Save the edited image
    await image.jpeg({ quality: 90 }).toFile(editedPath);

    // Update the photo edit record
    photoEdit.editedFileName = editedFileName;
    photoEdit.editedPath = editedPath;
    photoEdit.editSettings = filters;

    return this.photoEditRepository.save(photoEdit);
  }

  async getUserPhotos(userId: number): Promise<PhotoEdit[]> {
    return this.photoEditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPublicPhotos(): Promise<PhotoEdit[]> {
    return this.photoEditRepository.find({
      where: { isPublic: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async deletePhoto(photoId: number, userId: number): Promise<void> {
    const photoEdit = await this.photoEditRepository.findOne({
      where: { id: photoId, userId },
    });

    if (!photoEdit) {
      throw new NotFoundException('Photo not found');
    }

    // Delete files
    if (fs.existsSync(photoEdit.originalPath)) {
      fs.unlinkSync(photoEdit.originalPath);
    }
    if (fs.existsSync(photoEdit.editedPath) && photoEdit.editedPath !== photoEdit.originalPath) {
      fs.unlinkSync(photoEdit.editedPath);
    }

    await this.photoEditRepository.remove(photoEdit);
  }

  async togglePublic(photoId: number, userId: number): Promise<PhotoEdit> {
    const photoEdit = await this.photoEditRepository.findOne({
      where: { id: photoId, userId },
    });

    if (!photoEdit) {
      throw new NotFoundException('Photo not found');
    }

    photoEdit.isPublic = !photoEdit.isPublic;
    return this.photoEditRepository.save(photoEdit);
  }

  async getPhotoById(photoId: number, userId: number): Promise<PhotoEdit> {
    const photoEdit = await this.photoEditRepository.findOne({
      where: { id: photoId, userId },
    });

    if (!photoEdit) {
      throw new NotFoundException('Photo not found');
    }

    return photoEdit;
  }
}
