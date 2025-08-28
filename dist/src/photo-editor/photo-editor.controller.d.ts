import { Response } from 'express';
import { PhotoEditorService } from './photo-editor.service';
export declare class PhotoEditorController {
    private readonly photoEditorService;
    constructor(photoEditorService: PhotoEditorService);
    uploadImage(file: Express.Multer.File, req: any): Promise<import("./photo-editor.entity").PhotoEdit>;
    applyFilters(id: number, filters: any, req: any): Promise<import("./photo-editor.entity").PhotoEdit>;
    getMyPhotos(req: any): Promise<import("./photo-editor.entity").PhotoEdit[]>;
    getPublicPhotos(): Promise<import("./photo-editor.entity").PhotoEdit[]>;
    getPhotoById(id: number, req: any): Promise<import("./photo-editor.entity").PhotoEdit>;
    deletePhoto(id: number, req: any): Promise<{
        message: string;
    }>;
    togglePublic(id: number, req: any): Promise<import("./photo-editor.entity").PhotoEdit>;
    serveImage(filename: string, res: Response): Promise<void>;
    serveOriginalImage(filename: string, res: Response): Promise<void>;
}
