import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<import("./user.entity").User>;
    updateProfile(req: any, updateData: any): Promise<import("./user.entity").User>;
}
