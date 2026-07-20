import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { SendAdminOtpDto } from './dto/send-admin-otp.dto';
import { VerifyAdminOtpDto } from './dto/verify-admin-otp.dto';
import { AdminSignupDto } from './dto/admin-signup.dto';
import { GetAdminDashboardDto } from './dto/get-admin-dashboard.dto';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { RedisService } from 'src/redis/redis.service';
import { MailQueueService } from 'src/queues/mail-queue/mail-queue.service';
import { generateOTP } from 'src/common/utils/helpers';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import { Invoice, InvoiceDocument } from 'src/schemas/invoice.schema';
import { Subscription } from 'rxjs';
import { SubscriptionDocument } from 'src/schemas/subscription.schema';
import { PlatformSetting, PlatformSettingDocument } from 'src/schemas/platform-setting.schema';
import { JwtService } from '@nestjs/jwt';
import { generateUserId } from 'src/common/utils/generate-user-id';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {

    constructor(
        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,

        private readonly redisService:
            RedisService,

        private readonly mailQueueService:
            MailQueueService,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Customer.name)
        private readonly customerModel:
            Model<CustomerDocument>,

        @InjectModel(Invoice.name)
        private readonly invoiceModel:
            Model<InvoiceDocument>,

        @InjectModel(Subscription.name)
        private readonly subscriptionModel:
            Model<SubscriptionDocument>,

        @InjectModel(PlatformSetting.name)
        private readonly platformSettingModel:
            Model<PlatformSettingDocument>,

        private readonly jwtService:
            JwtService,
    ) { }

    async sendOtp(
        dto: SendAdminOtpDto,
    ) {

        const adminExists =
            await this.userModel.findOne({

                role:
                    UserRole.SUPER_ADMIN,

            });

        if (adminExists) {

            throw new BadRequestException(
                'Super admin already exists.',
            );

        }

        const otp =
            generateOTP();

        await this.redisService.set(
            `ADMIN_OTP_${dto.email}`,
            otp.toString(),
            300,
        );

        await this.mailQueueService
            .sendOTPEmailAdmin({

                to: dto.email,

                subject:
                    'Admin OTP Verification',

                html: `
                <h2>Welcome to Salon Marketplace</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP is valid for 5 minutes.</p>
            `,

            });

        return {

            success: true,

            message:
                'OTP sent successfully.',

        };

    }

    async verifyOtp(
        dto: VerifyAdminOtpDto,
    ) {

        const adminExists =
            await this.userModel.findOne({

                role:
                    UserRole.SUPER_ADMIN,

            });

        if (adminExists) {

            throw new BadRequestException(
                'Super admin already exists.',
            );

        }

        const savedOtp =
            await this.redisService.get(

                `ADMIN_OTP_${dto.email}`,

            );

        if (!savedOtp) {

            throw new BadRequestException(
                'OTP expired or not found.',
            );

        }

        if (
            savedOtp !==
            dto.otp
        ) {

            throw new BadRequestException(
                'Invalid OTP.',
            );

        }

        await this.redisService.del(

            `ADMIN_OTP_${dto.email}`,

        );

        return {

            success: true,

            message:
                'OTP verified successfully.',

        };

    }

    async signup(
        dto: AdminSignupDto,
    ) {

        const adminExists =
            await this.userModel.findOne({

                role:
                    UserRole.SUPER_ADMIN,

            });

        if (adminExists) {

            throw new BadRequestException(
                'Super admin already exists.',
            );

        }

        const emailExists =
            await this.userModel.findOne({

                email:
                    dto.email.toLowerCase(),

            });

        if (emailExists) {

            throw new BadRequestException(
                'Email already exists.',
            );

        }

        const hashedPassword =
            await bcrypt.hash(
                dto.password,
                10,
            );

        const admin =
            await this.userModel.create({

                userId:
                    generateUserId(
                        UserRole.SUPER_ADMIN,
                    ),

                name:
                    dto.name,

                email:
                    dto.email.toLowerCase(),

                phone:
                    dto.phone,

                password:
                    hashedPassword,

                role:
                    UserRole.SUPER_ADMIN,

                isActive:
                    true,

            });

        const platformSettings =
            await this.platformSettingModel
                .findOne();

        if (!platformSettings) {

            await this.platformSettingModel
                .create({

                    supportEmail:
                        dto.email.toLowerCase(),

                });

        }

        const payload = {

            sub:
                admin._id,

            role:
                admin.role,

            email:
                admin.email,

        };

        const accessToken =
            await this.jwtService.signAsync(
                payload,
            );

        return {

            success: true,

            message:
                'Super admin created successfully.',

            data: {

                admin,

                accessToken,

            },

        };

    }

    async getDashboard(
        user: any,
        query: GetAdminDashboardDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const totalSalons =
            await this.salonModel
                .countDocuments();

        const totalCustomers =
            await this.customerModel
                .countDocuments();

        const totalSubscriptions =
            await this.subscriptionModel
                .countDocuments();

        const totalRevenue =
            await this.invoiceModel.aggregate([

                {

                    $match: {

                        isDeleted: false,

                    },

                },

                {

                    $group: {

                        _id: null,

                        total: {

                            $sum:
                                '$finalAmount',

                        },

                    },

                },

            ]);

        return {

            success: true,

            message:
                'Admin dashboard fetched successfully.',

            data: {
                totalSalons,
                totalCustomers,
                totalSubscriptions,
                totalRevenue:
                    totalRevenue[0]?.total || 0,

            },

        };

    }

    async getAnalytics(
        user: any,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const activeSalons =
            await this.salonModel
                .countDocuments({

                    isActive: true,

                });

        const inactiveSalons =
            await this.salonModel
                .countDocuments({

                    isActive: false,

                });

        const activeSubscriptions =
            await this.subscriptionModel
                .countDocuments({

                    isActive: true,

                });

        const inactiveSubscriptions =
            await this.subscriptionModel
                .countDocuments({

                    isActive: false,

                });

        const totalCustomers =
            await this.customerModel
                .countDocuments();

        return {
            success: true,
            message:
                'Analytics fetched successfully.',
            data: {
                activeSalons,
                inactiveSalons,
                activeSubscriptions,
                inactiveSubscriptions,
                totalCustomers,

            },

        };

    }

    async getReports(
        user: any,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const totalSalons =
            await this.salonModel
                .countDocuments({

                    isDeleted: false,

                });

        const totalCustomers =
            await this.customerModel
                .countDocuments({

                    isDeleted: false,

                });

        const totalSubscriptions =
            await this.subscriptionModel
                .countDocuments({

                    isDeleted: false,

                });

        const totalRevenue =
            await this.invoiceModel.aggregate([

                {

                    $match: {

                        isDeleted: false,

                    },

                },

                {

                    $group: {

                        _id: null,

                        amount: {

                            $sum:
                                '$finalAmount',

                        },

                    },

                },

            ]);

        return {

            success: true,

            message:
                'Platform reports fetched successfully.',

            data: {

                totalSalons,

                totalCustomers,

                totalSubscriptions,

                totalRevenue:
                    totalRevenue[0]?.amount || 0,

            },

        };

    }

    async getPlatformSettings(
        user: any,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const settings =
            await this.platformSettingModel
                .findOne();

        if (!settings) {

            throw new BadRequestException(
                'Platform settings not found.',
            );

        }

        return {

            success: true,

            message:
                'Platform settings fetched successfully.',

            data:
                settings,

        };

    }

    async updatePlatformSettings(
        user: any,
        dto: UpdatePlatformSettingsDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const settings =
            await this.platformSettingModel
                .findOne();

        if (!settings) {

            throw new BadRequestException(
                'Platform settings not found.',
            );

        }

        Object.assign(
            settings,
            dto,
        );

        await settings.save();

        return {

            success: true,

            message:
                'Platform settings updated successfully.',

            data:
                settings,

        };

    }

    async getSalons(
        user: any,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const salons =
            await this.salonModel

                .find({

                    isDeleted: false,

                })

                .populate(
                    'subscriptionId',
                );

        const totalSalons =
            salons.length;

        const activeSalons =
            salons.filter(
                salon =>
                    salon.isActive,
            ).length;

        const inactiveSalons =
            salons.filter(
                salon =>
                    !salon.isActive,
            ).length;

        return {

            success: true,

            message:
                'Salons fetched successfully.',

            data: {

                totalSalons,

                activeSalons,

                inactiveSalons,

                salons,

            },

        };

    }

    async updateSalonStatus(
        user: any,
        id: string,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const salon =
            await this.salonModel.findById(
                id,
            );

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        salon.isActive =
            !salon.isActive;

        await salon.save();

        return {

            success: true,

            message:
                `Salon ${salon.isActive
                    ? 'activated'
                    : 'deactivated'
                } successfully.`,

            data:
                salon,

        };

    }

    async deleteSalon(
        user: any,
        id: string,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const salon =
            await this.salonModel.findById(
                id,
            );

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        salon.isDeleted = true;

        salon.isActive = false;

        await salon.save();

        return {

            success: true,

            message:
                'Salon deleted successfully.',

            data:
                salon,

        };

    }

}