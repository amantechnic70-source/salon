import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import {
    User,
    UserDocument,
} from '../schemas/user.schema';

import { RegisterDto } from './dto/register.dto';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from 'src/redis/redis.service';
import { MailQueueService } from 'src/queues/mail-queue/mail-queue.service';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        private readonly redisService: RedisService,
        private readonly mailQueueService: MailQueueService,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {

        const existingUser =
            await this.userModel.findOne({
                email: dto.email,
            });

        if (existingUser) {

            throw new BadRequestException(
                'Email already exists',
            );

        }

        const hashedPassword =
            await bcrypt.hash(
                dto.password,
                10,
            );

        const user =
            await this.userModel.create({

                name: dto.ownerName,
                email: dto.email,
                phone: dto.phone,
                password: hashedPassword,
                role: 'SALON_OWNER',

            });

        return {
            success: true,
            message: 'Registration successful',
            data: user,

        };

    }

    async login(dto: LoginDto) {

        const user =
            await this.userModel.findOne({
                email: dto.email,
            });

        // if (user.isDeleted) {
        //     throw new UnauthorizedException(
        //         'Your account has been deleted.',
        //     );
        // }

        // if (!user.isActive) {
        //     throw new UnauthorizedException(
        //         'Your account has been deactivated.',
        //     );
        // }

        if (!user) {

            throw new UnauthorizedException(
                'User not found, please go first signup',
            );

        }

        const isMatch =
            await bcrypt.compare(
                dto.password,
                user.password,
            );

        if (!isMatch) {

            throw new UnauthorizedException(
                'Invalid credentials',
            );

        }

        const payload = {
            sub: user._id,
            email: user.email,
            role: user.role,
            salonId: user.salonId,
        };

        const accessToken =
            this.jwtService.sign(
                payload,
            );

        return {
            success: true,
            accessToken,
            user: {
                id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                salonId: user.salonId,
            },
        };

    }

    async logout(
        userId: string,
    ) {

        // Delete refresh token from Redis

        await this.redisService.del(

            `refresh-token:${userId}`,

        );


        return {

            success: true,

            message:
                'Logout successful.',

        };

    }

    async refreshToken(
        dto: RefreshTokenDto,
    ) {

        // Verify refresh token

        const payload = this.jwtService.verify(

            dto.refreshToken,

            {

                secret:
                    process.env.JWT_REFRESH_SECRET,

            },

        );


        // Get refresh token stored in Redis

        const savedRefreshToken =
            await this.redisService.get(

                `refresh-token:${payload.sub}`,

            );


        // Check token exists in Redis

        if (!savedRefreshToken) {

            throw new UnauthorizedException(

                'Refresh token has expired or is invalid.',

            );

        }


        // Compare both tokens

        if (
            savedRefreshToken !== dto.refreshToken
        ) {

            throw new UnauthorizedException(

                'Invalid refresh token.',

            );

        }


        // Generate new access token

        const accessToken =
            this.jwtService.sign({

                sub: payload.sub,

                email: payload.email,

                role: payload.role,

                salonId: payload.salonId,

            });


        // OPTIONAL:
        // Generate a new refresh token
        // Uncomment if you want token rotation


        /*
        const refreshToken =
            this.jwtService.sign(
    
                {
    
                    sub: payload.sub,
    
                    email: payload.email,
    
                    role: payload.role,
    
                    salonId: payload.salonId,
    
                },
    
                {
    
                    secret:
                        process.env.JWT_REFRESH_SECRET,
    
                    expiresIn:
                        process.env.JWT_REFRESH_EXPIRES_IN,
    
                },
    
            );
    
    
        await this.redisService.set(
    
            `refresh-token:${payload.sub}`,
    
            refreshToken,
    
            60 * 60 * 24 * 7,
    
        );
        */


        return {

            success: true,

            accessToken,

            // refreshToken,

        };

    }

    async forgotPassword(
        dto: ForgotPasswordDto,
    ) {

        // Check user exists

        const user = await this.userModel.findOne({
            email: dto.email,
        });

        if (!user) {

            throw new BadRequestException(
                'User not found',
            );

        }

        // Generate reset token

        const token = uuidv4();


        // Store token in redis for 15 minutes

        await this.redisService.set(

            `reset-password:${token}`,

            user.email,

            900,

        );


        // Generate reset link

        const resetLink =

            `${process.env.FRONTEND_URL}/reset-password?token=${token}`;


        // Prepare email template

        const html = `

        <h2>Reset Password</h2>

        <p>Hello ${user.name},</p>

        <p>
            Click the button below to reset your password.
        </p>

        <br/>

        <a href="${resetLink}">
            Reset Password
        </a>

        <br/><br/>

        <p>
            This link will expire in 15 minutes.
        </p>

    `;


        // Push email into queue

        await this.mailQueueService.sendForgotPasswordEmail({

            email: user.email,

            subject: 'Reset Password',

            html,

        });


        return {

            success: true,

            message:
                'Password reset link sent successfully.',

        };

    }

    async resetPassword(
        dto: ResetPasswordDto,
    ) {

        // Get email from Redis

        const email = await this.redisService.get(

            `reset-password:${dto.token}`,

        );


        // Check token validity

        if (!email) {

            throw new BadRequestException(

                'Invalid or expired reset password token.',

            );

        }


        // Find user

        const user = await this.userModel.findOne({

            email,

        });


        if (!user) {

            throw new BadRequestException(

                'User not found.',

            );

        }


        // Hash new password

        const hashedPassword = await bcrypt.hash(

            dto.password,

            10,

        );


        // Update password

        user.password = hashedPassword;

        await user.save();


        // Delete token from Redis

        await this.redisService.del(

            `reset-password:${dto.token}`,

        );


        // Password changed email template

        const html = `

        <h2>Password Changed Successfully</h2>

        <p>Hello ${user.name},</p>

        <p>

            Your account password has been changed successfully.

        </p>

        <p>

            If you did not perform this action, please contact support immediately.

        </p>

    `;


        // Send mail using queue

        await this.mailQueueService.sendPasswordChangedEmail({

            email: user.email,

            subject: 'Password Changed Successfully',

            html,

        });


        // Response

        return {

            success: true,

            message:

                'Password reset successfully.',

        };

    }

    async changePassword(

        userId: string,

        dto: ChangePasswordDto,

    ) {

        // Find user

        const user = await this.userModel.findById(
            userId,
        );


        if (!user) {

            throw new BadRequestException(
                'User not found',
            );

        }


        // Check current password

        const isPasswordMatched =
            await bcrypt.compare(

                dto.currentPassword,

                user.password,

            );


        if (!isPasswordMatched) {

            throw new BadRequestException(
                'Current password is incorrect',
            );

        }


        // Prevent using the same password

        const isSamePassword =
            await bcrypt.compare(

                dto.newPassword,

                user.password,

            );


        if (isSamePassword) {

            throw new BadRequestException(

                'New password cannot be the same as the current password.',

            );

        }


        // Hash new password

        const hashedPassword =
            await bcrypt.hash(

                dto.newPassword,

                10,

            );


        // Update password

        user.password = hashedPassword;

        await user.save();


        // Password changed email template

        const html = `

        <h2>Password Changed Successfully</h2>

        <p>Hello ${user.name},</p>

        <p>

            Your account password has been changed successfully.

        </p>

        <p>

            If you did not perform this action, please contact support immediately.

        </p>

    `;


        // Send confirmation email using queue

        await this.mailQueueService.sendPasswordChangedEmail({

            email: user.email,

            subject: 'Password Changed Successfully',

            html,

        });


        // Success response

        return {

            success: true,

            message:
                'Password changed successfully.',

        };

    }

    async profile(user: any) {

        const profile =
            await this.userModel
                .findById(
                    user.sub,
                )
                .select(
                    '-password',
                );


        if (!profile) {

            throw new BadRequestException(
                'User not found',
            );

        }


        return {

            success: true,

            data: profile,

        };

    }

}