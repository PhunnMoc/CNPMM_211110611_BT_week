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
exports.PhotoEditorController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const photo_editor_service_1 = require("./photo-editor.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const fs = require("fs");
let PhotoEditorController = class PhotoEditorController {
    constructor(photoEditorService) {
        this.photoEditorService = photoEditorService;
    }
    async uploadImage(file, req) {
        return this.photoEditorService.uploadImage(file, req.user.id);
    }
    async applyFilters(id, filters, req) {
        return this.photoEditorService.applyFilters(id, filters, req.user.id);
    }
    async getMyPhotos(req) {
        return this.photoEditorService.getUserPhotos(req.user.id);
    }
    async getPublicPhotos() {
        return this.photoEditorService.getPublicPhotos();
    }
    async getPhotoById(id, req) {
        return this.photoEditorService.getPhotoById(id, req.user.id);
    }
    async deletePhoto(id, req) {
        await this.photoEditorService.deletePhoto(id, req.user.id);
        return { message: 'Photo deleted successfully' };
    }
    async togglePublic(id, req) {
        return this.photoEditorService.togglePublic(id, req.user.id);
    }
    async serveImage(filename, res) {
        const filePath = `uploads/edited/${filename}`;
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath, { root: '.' });
        }
        else {
            res.status(404).json({ message: 'Image not found' });
        }
    }
    async serveOriginalImage(filename, res) {
        const filePath = `uploads/original/${filename}`;
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath, { root: '.' });
        }
        else {
            res.status(404).json({ message: 'Image not found' });
        }
    }
};
exports.PhotoEditorController = PhotoEditorController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PhotoEditorController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Put)(':id/filters'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PhotoEditorController.prototype, "applyFilters", null);
__decorate([
    (0, common_1.Get)('my-photos'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PhotoEditorController.prototype, "getMyPhotos", null);
__decorate([
    (0, common_1.Get)('public-photos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PhotoEditorController.prototype, "getPublicPhotos", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PhotoEditorController.prototype, "getPhotoById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PhotoEditorController.prototype, "deletePhoto", null);
__decorate([
    (0, common_1.Put)(':id/toggle-public'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PhotoEditorController.prototype, "togglePublic", null);
__decorate([
    (0, common_1.Get)('image/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhotoEditorController.prototype, "serveImage", null);
__decorate([
    (0, common_1.Get)('original/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhotoEditorController.prototype, "serveOriginalImage", null);
exports.PhotoEditorController = PhotoEditorController = __decorate([
    (0, common_1.Controller)('photo-editor'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [photo_editor_service_1.PhotoEditorService])
], PhotoEditorController);
//# sourceMappingURL=photo-editor.controller.js.map