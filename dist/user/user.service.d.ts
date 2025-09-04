import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: any): Promise<User>;
    findByEmail(email: string): Promise<User>;
    findById(id: number): Promise<User>;
    generateOTP(email: string): Promise<string>;
    verifyOTP(email: string, otp: string): Promise<boolean>;
    generateResetPasswordToken(email: string): Promise<string>;
    resetPassword(token: string, newPassword: string): Promise<boolean>;
    updateProfile(id: number, updateData: any): Promise<User>;
}
