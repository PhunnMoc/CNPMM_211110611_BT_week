import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    private readonly mailService;
    constructor(authService: AuthService, userService: UserService, mailService: MailService);
    register(registerDto: any): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            isEmailVerified: boolean;
            otpCode: string;
            otpExpiresAt: Date;
            resetPasswordToken: string;
            resetPasswordExpires: Date;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(loginDto: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            isEmailVerified: any;
        };
    }>;
    verifyOTP(verifyDto: any): Promise<{
        message: string;
    }>;
    resendOTP(resendDto: any): Promise<{
        message: string;
    }>;
    forgotPassword(forgotDto: any): Promise<{
        message: string;
        token: string;
    }>;
    resetPassword(resetDto: any): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<import("../user/user.entity").User>;
}
