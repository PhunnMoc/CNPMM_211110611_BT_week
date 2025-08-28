"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoEditorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const photo_editor_entity_1 = require("./photo-editor.entity");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto_1 = require("crypto");
let PhotoEditorService = class PhotoEditorService {
    constructor(photoEditRepository) {
        this.photoEditRepository = photoEditRepository;
        this.ensureDirectories();
    }
    ensureDirectories() {
        const dirs = ['uploads', 'uploads/original', 'uploads/edited'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    async uploadImage(file, userId) {
        const fileName = `${(0, crypto_1.randomUUID)()}-${file.originalname}`;
        const filePath = path.join('uploads', 'original', fileName);
        fs.writeFileSync(filePath, file.buffer);
        const photoEdit = this.photoEditRepository.create({
            originalFileName: file.originalname,
            editedFileName: fileName,
            originalPath: filePath,
            editedPath: filePath,
            userId,
        });
        return this.photoEditRepository.save(photoEdit);
    }
    async applyFilters(photoId, filters, userId) {
        const photoEdit = await this.photoEditRepository.findOne({
            where: { id: photoId, userId },
        });
        if (!photoEdit) {
            throw new common_1.NotFoundException('Photo not found');
        }
        let image = sharp(photoEdit.originalPath);
        if (filters.brightness) {
            image = image.modulate({ brightness: filters.brightness });
        }
        if (filters.contrast) {
            image = image.modulate({ saturation: filters.contrast });
        }
        if (filters.saturation) {
            image = image.modulate({ saturation: filters.saturation });
        }
        if (filters.blur) {
            image = image.blur(filters.blur);
        }
        if (filters.sharpen) {
            image = image.sharpen(filters.sharpen);
        }
        if (filters.grayscale) {
            image = image.grayscale();
        }
        if (filters.sepia) {
            image = image.modulate({
                hue: 30,
                saturation: 0.5,
            });
        }
        if (filters.rotation) {
            image = image.rotate(filters.rotation);
        }
        if (filters.flip) {
            image = image.flip();
        }
        if (filters.flop) {
            image = image.flop();
        }
        if (filters.width || filters.height) {
            image = image.resize(filters.width, filters.height, {
                fit: filters.fit || 'cover',
            });
        }
        if (filters.crop) {
            image = image.extract({
                left: filters.crop.left,
                top: filters.crop.top,
                width: filters.crop.width,
                height: filters.crop.height,
            });
        }
        const editedFileName = `edited-${(0, crypto_1.randomUUID)()}.jpg`;
        const editedPath = path.join('uploads', 'edited', editedFileName);
        await image.jpeg({ quality: 90 }).toFile(editedPath);
        photoEdit.editedFileName = editedFileName;
        photoEdit.editedPath = editedPath;
        photoEdit.editSettings = filters;
        return this.photoEditRepository.save(photoEdit);
    }
    async getUserPhotos(userId) {
        return this.photoEditRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getPublicPhotos() {
        return this.photoEditRepository.find({
            where: { isPublic: true },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
    async deletePhoto(photoId, userId) {
        const photoEdit = await this.photoEditRepository.findOne({
            where: { id: photoId, userId },
        });
        if (!photoEdit) {
            throw new common_1.NotFoundException('Photo not found');
        }
        if (fs.existsSync(photoEdit.originalPath)) {
            fs.unlinkSync(photoEdit.originalPath);
        }
        if (fs.existsSync(photoEdit.editedPath) && photoEdit.editedPath !== photoEdit.originalPath) {
            fs.unlinkSync(photoEdit.editedPath);
        }
        await this.photoEditRepository.remove(photoEdit);
    }
    async togglePublic(photoId, userId) {
        const photoEdit = await this.photoEditRepository.findOne({
            where: { id: photoId, userId },
        });
        if (!photoEdit) {
            throw new common_1.NotFoundException('Photo not found');
        }
        photoEdit.isPublic = !photoEdit.isPublic;
        return this.photoEditRepository.save(photoEdit);
    }
    async getPhotoById(photoId, userId) {
        const photoEdit = await this.photoEditRepository.findOne({
            where: { id: photoId, userId },
        });
        if (!photoEdit) {
            throw new common_1.NotFoundException('Photo not found');
        }
        return photoEdit;
    }
};
exports.PhotoEditorService = PhotoEditorService;
exports.PhotoEditorService = PhotoEditorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(photo_editor_entity_1.PhotoEdit)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PhotoEditorService);
//# sourceMappingURL=photo-editor.service.js.map