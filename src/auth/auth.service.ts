import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async register(registerDto: any) {
    const user = await this.userService.create(registerDto);
    const { password, ...result } = user;
    return result;
  }

  async verifyOTP(email: string, otp: string) {
    const isValid = await this.userService.verifyOTP(email, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const token = await this.userService.generateResetPasswordToken(email);
    // In a real application, you would send this token via email
    return { message: 'Reset password token generated', token };
  }

  async resetPassword(token: string, newPassword: string) {
    const success = await this.userService.resetPassword(token, newPassword);
    if (!success) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    return { message: 'Password reset successfully' };
  }
}
