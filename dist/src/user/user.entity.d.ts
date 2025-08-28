export declare class User {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    otpCode: string;
    otpExpiresAt: Date;
    resetPasswordToken: string;
    resetPasswordExpires: Date;
    createdAt: Date;
    updatedAt: Date;
}
