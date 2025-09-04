import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<import("./user.entity").User>;
    updateProfile(req: any, updateData: UpdateUserDto): Promise<import("./user.entity").User>;
    uploadAvatar(req: any, file: Express.Multer.File): Promise<import("./user.entity").User>;
}
