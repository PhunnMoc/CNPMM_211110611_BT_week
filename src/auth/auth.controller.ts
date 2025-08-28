import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    const user = await this.authService.register(registerDto);
    
    // Generate OTP and send email
    const otp = await this.userService.generateOTP(registerDto.email);
    await this.mailService.sendOTP(registerDto.email, otp);
    
    return {
      message: 'Registration successful. Please check your email for OTP verification.',
      user,
    };
  }

  @Post('login')
  async login(@Body() loginDto: any) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('verify-otp')
  async verifyOTP(@Body() verifyDto: any) {
    return this.authService.verifyOTP(verifyDto.email, verifyDto.otp);
  }

  @Post('resend-otp')
  async resendOTP(@Body() resendDto: any) {
    const otp = await this.userService.generateOTP(resendDto.email);
    await this.mailService.sendOTP(resendDto.email, otp);
    return { message: 'OTP sent successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotDto: any) {
    const result = await this.authService.forgotPassword(forgotDto.email);
    // In a real application, you would send the token via email
    return result;
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: any) {
    return this.authService.resetPassword(resetDto.token, resetDto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.userService.findById(req.user.id);
  }
}
