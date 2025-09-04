"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoEditorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const photo_editor_controller_1 = require("./photo-editor.controller");
const photo_editor_service_1 = require("./photo-editor.service");
const photo_editor_entity_1 = require("./photo-editor.entity");
let PhotoEditorModule = class PhotoEditorModule {
};
exports.PhotoEditorModule = PhotoEditorModule;
exports.PhotoEditorModule = PhotoEditorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([photo_editor_entity_1.PhotoEdit]),
            platform_express_1.MulterModule.register({
                dest: './uploads',
            }),
        ],
        controllers: [photo_editor_controller_1.PhotoEditorController],
        providers: [photo_editor_service_1.PhotoEditorService],
    })
], PhotoEditorModule);
//# sourceMappingURL=photo-editor.module.js.map