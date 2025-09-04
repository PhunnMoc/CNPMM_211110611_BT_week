import { Repository } from 'typeorm';
import { PhotoEdit } from './photo-editor.entity';
export declare class PhotoEditorService {
    private photoEditRepository;
    constructor(photoEditRepository: Repository<PhotoEdit>);
    private ensureDirectories;
    uploadImage(file: Express.Multer.File, userId: number): Promise<PhotoEdit>;
    applyFilters(photoId: number, filters: any, userId: number): Promise<PhotoEdit>;
    getUserPhotos(userId: number): Promise<PhotoEdit[]>;
    getPublicPhotos(): Promise<PhotoEdit[]>;
    deletePhoto(photoId: number, userId: number): Promise<void>;
    togglePublic(photoId: number, userId: number): Promise<PhotoEdit>;
    getPhotoById(photoId: number, userId: number): Promise<PhotoEdit>;
}
