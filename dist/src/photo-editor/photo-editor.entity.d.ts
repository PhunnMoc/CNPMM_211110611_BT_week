import { User } from '../user/user.entity';
export declare class PhotoEdit {
    id: number;
    originalFileName: string;
    editedFileName: string;
    originalPath: string;
    editedPath: string;
    editSettings: any;
    isPublic: boolean;
    user: User;
    userId: number;
    createdAt: Date;
}
