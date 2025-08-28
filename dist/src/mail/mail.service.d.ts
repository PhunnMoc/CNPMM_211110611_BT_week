export declare class MailService {
    private transporter;
    constructor();
    sendOTP(email: string, otp: string): Promise<void>;
    sendResetPassword(email: string, token: string): Promise<void>;
}
