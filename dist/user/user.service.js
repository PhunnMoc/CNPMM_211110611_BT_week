"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = new user_entity_1.User();
        user.email = createUserDto.email;
        user.password = hashedPassword;
        user.firstName = createUserDto.firstName;
        user.lastName = createUserDto.lastName;
        return await this.userRepository.save(user);
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async findById(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async generateOTP(email) {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.userRepository.update(user.id, {
            otpCode: otp,
            otpExpiresAt,
        });
        return otp;
    }
    async verifyOTP(email, otp) {
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
    async generateResetPasswordToken(email) {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.userRepository.update(user.id, {
            resetPasswordToken: token,
            resetPasswordExpires: expiresAt,
        });
        return token;
    }
    async resetPassword(token, newPassword) {
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
    async updateProfile(id, updateData) {
        const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'avatar'];
        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }
        if (Object.keys(filteredData).length === 0) {
            throw new Error('No valid fields to update');
        }
        await this.userRepository.update(id, filteredData);
        return this.findById(id);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map