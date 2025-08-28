import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: any): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new User();
    user.email = createUserDto.email;
    user.password = hashedPassword;
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;

    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async generateOTP(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.userRepository.update(user.id, {
      otpCode: otp,
      otpExpiresAt,
    });

    return otp;
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return false;
    }

    if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
      return false;
    }

    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      otpCode: null,
      otpExpiresAt: null,
    });

    return true;
  }

  async generateResetPasswordToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expiresAt,
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return true;
  }

  async updateProfile(id: number, updateData: any): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }
}
