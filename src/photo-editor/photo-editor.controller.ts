import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PhotoEditorService } from './photo-editor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as fs from 'fs';

@Controller('photo-editor')
@UseGuards(JwtAuthGuard)
export class PhotoEditorController {
  constructor(private readonly photoEditorService: PhotoEditorService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.photoEditorService.uploadImage(file, req.user.id);
  }

  @Put(':id/filters')
  async applyFilters(
    @Param('id') id: number,
    @Body() filters: any,
    @Request() req,
  ) {
    return this.photoEditorService.applyFilters(id, filters, req.user.id);
  }

  @Get('my-photos')
  async getMyPhotos(@Request() req) {
    return this.photoEditorService.getUserPhotos(req.user.id);
  }

  @Get('public-photos')
  async getPublicPhotos() {
    return this.photoEditorService.getPublicPhotos();
  }

  @Get(':id')
  async getPhotoById(@Param('id') id: number, @Request() req) {
    return this.photoEditorService.getPhotoById(id, req.user.id);
  }

  @Delete(':id')
  async deletePhoto(@Param('id') id: number, @Request() req) {
    await this.photoEditorService.deletePhoto(id, req.user.id);
    return { message: 'Photo deleted successfully' };
  }

  @Put(':id/toggle-public')
  async togglePublic(@Param('id') id: number, @Request() req) {
    return this.photoEditorService.togglePublic(id, req.user.id);
  }

  @Get('image/:filename')
  async serveImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = `uploads/edited/${filename}`;
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath, { root: '.' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  }

  @Get('original/:filename')
  async serveOriginalImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = `uploads/original/${filename}`;
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath, { root: '.' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  }
}
