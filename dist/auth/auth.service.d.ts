import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
export declare class AuthService {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            isEmailVerified: any;
        };
    }>;
    register(registerDto: any): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        avatar: string;
        isEmailVerified: boolean;
        otpCode: string;
        otpExpiresAt: Date;
        resetPasswordToken: string;
        resetPasswordExpires: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    verifyOTP(email: string, otp: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
        token: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
