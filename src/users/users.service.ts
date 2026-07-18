import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CustomerSignupDto } from './dto/customer-signup.dto';
import { SalonSignupDto } from './dto/salon-signup.dto';
import { UpdateProfileDto } from './dto/update-user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisService } from 'src/redis/redis.service';
import { MailQueueService } from 'src/queues/mail-queue/mail-queue.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { generateUserId } from 'src/common/utils/generate-user-id';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        private readonly redisService: RedisService,
        private readonly mailQueueService: MailQueueService,
    ) { }


    async sendOTP(
        dto: SendOtpDto,
    ) {

        // Check if user already exists

        const existingUser =
            await this.userModel.findOne({

                email: dto.email,

            });


        if (existingUser) {

            throw new BadRequestException(

                'User already exists with this email.',

            );

        }


        // Generate 6 digit OTP

        const otp = this.generateOTP();


        // Save OTP in Redis for 5 minutes

        await this.redisService.set(

            `user-otp:${dto.email}`,

            otp,

            300,

        );


        // Prepare email template

        const html = `

        <h2>Email Verification</h2>

        <p>
            Hello,
        </p>

        <p>
            Your OTP for email verification is:
        </p>

        <h1>
            ${otp}
        </h1>

        <p>
            This OTP is valid for 5 minutes.
        </p>

        <p>
            Please do not share this OTP with anyone.
        </p>

    `;


        // Send OTP email using Mail Queue

        await this.mailQueueService.sendOTPEmail({
            email: dto.email,
            subject: 'Verify Your Email',
            html,

        });


        // Response

        return {
            success: true,
            message: 'OTP sent successfully.',
        };

    }

    async verifyOTP(
        dto: VerifyOtpDto,
    ) {

        // Get OTP from Redis

        const savedOTP = await this.redisService.get(

            `user-otp:${dto.email}`,

        );

        // Check if OTP exists
        if (!savedOTP) {
            throw new BadRequestException(
                'OTP has expired. Please request a new OTP.',

            );

        }

        // Check OTP validity

        if (savedOTP !== dto.otp) {

            throw new BadRequestException(

                'Invalid OTP.',

            );

        }


        // Delete OTP after successful verification

        await this.redisService.del(

            `user-otp:${dto.email}`,

        );


        // Save email verified status in Redis
        // Valid for 10 minutes

        await this.redisService.set(

            `verified-email:${dto.email}`,
            'true',
            600,

        );


        return {

            success: true,

            message: 'OTP verified successfully.',

        };

    }

    async customerSignup(
        dto: CustomerSignupDto,
    ) {

        // Check email verification status
        const isVerified = await this.redisService.get(
            `verified-email:${dto.email}`,
        );

        if (!isVerified) {

            throw new BadRequestException(

                'Please verify your email first.',
            );

        }

        // Check email already exists
        const existingEmail = await this.userModel.findOne({
            email: dto.email,

        });

        if (existingEmail) {
            throw new BadRequestException(
                'Email already exists.',
            );
        }

        // Check phone already exists
        const existingPhone = await this.userModel.findOne({
            phone: dto.phone,
        });

        if (existingPhone) {
            throw new BadRequestException(
                'Phone number already exists.',
            );

        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            dto.password,
            10,
        );

        const userId = generateUserId(
            UserRole.CUSTOMER,
        );

        // Create customer
        const customer = await this.userModel.create({
            userId,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
            role: UserRole.CUSTOMER,
            isVerified: true,
            isActive: true,
        });

        // Delete verified email key
        await this.redisService.del(
            `verified-email:${dto.email}`,
        );

        return {

            success: true,
            message: 'Customer account created successfully.',
            data: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                role: customer.role,

            },

        };

    }

    async salonSignup(dto: SalonSignupDto) {

        const isVerified = await this.redisService.get(
            `verified-email:${dto.email}`,
        );

        if (!isVerified) {
            throw new BadRequestException(
                'Please verify your email first.',
            );
        }

        const existingUser = await this.userModel.findOne({
            $or: [
                { email: dto.email },
                { phone: dto.phone },
            ],
        });

        if (existingUser) {
            throw new BadRequestException(
                'User already exists with this email or phone number.',
            );
        }

        const hashedPassword = await bcrypt.hash(
            dto.password,
            10,
        );

        const userId = generateUserId(
            UserRole.SALON_OWNER,
        );

        const salonOwner = await this.userModel.create({
            userId,
            name: dto.ownerName,
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
            role: UserRole.SALON_OWNER,
            isVerified: true,
            isActive: true,
        });

        await this.redisService.del(
            `verified-email:${dto.email}`,
        );

        return {
            success: true,
            message: 'Salon owner account created successfully.',
            data: {
                id: salonOwner._id,
                userId: salonOwner.userId,
                name: salonOwner.name,
                email: salonOwner.email,
                role: salonOwner.role,
            },
        };

    }

    async profile(userId: string) {

        const profile = await this.userModel
            .findById(userId)
            .select('-password');

        if (!profile) {
            throw new BadRequestException(
                'User not found.',
            );
        }

        return {
            success: true,
            data: profile,
        };

    }

    async updateProfile(
        userId: string,
        dto: UpdateProfileDto,
    ) {

        const user = await this.userModel.findById(
            userId,
        );

        if (!user) {
            throw new BadRequestException(
                'User not found.',
            );
        }

        // Check email uniqueness
        if (dto.email && dto.email !== user.email) {
            const existingEmail =
                await this.userModel.findOne({
                    email: dto.email,
                });

            if (existingEmail) {
                throw new BadRequestException(
                    'Email already exists.',
                );
            }

        }

        // Check phone uniqueness
        if (dto.phone && dto.phone !== user.phone) {
            const existingPhone =
                await this.userModel.findOne({
                    phone: dto.phone,
                });

            if (existingPhone) {
                throw new BadRequestException(
                    'Phone number already exists.',
                );
            }

        }

        // Update profile

        await this.userModel.findByIdAndUpdate(
            userId,
            {
                ...dto,
            },
            {
                new: true,
            },
        );

        const updatedUser =
            await this.userModel
                .findById(userId)
                .select('-password');

        return {
            success: true,
            message: 'Profile updated successfully.',
            data: updatedUser,
        };

    }

    async deleteAccount(
        userId: string,
    ) {

        const user = await this.userModel.findById(
            userId,
        );

        if (!user) {
            throw new BadRequestException(
                'User not found.',
            );
        }

        if (!user.isActive) {
            throw new BadRequestException(
                'Account is already deleted.',
            );
        }

        user.isActive = false;
        await user.save();

        return {
            success: true,
            message: 'Account deleted successfully.',
        };

    }

    // SUPER ADMIN
    async getAllUsers(
        user: any,
        query: GetUsersDto,
    ) {

        if (user.role !== UserRole.SUPER_ADMIN) {
            throw new UnauthorizedException(
                'You are not authorized.',
            );
        }

        const {
            page = '1',
            limit = '10',
            search,
            role,
            isActive,
            isVerified,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = query;

        const filter: any = {};
        // Search
        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: 'i',
                    },
                },

                {
                    email: {
                        $regex: search,
                        $options: 'i',
                    },
                },

                {
                    phone: {
                        $regex: search,
                        $options: 'i',
                    },
                },

                {
                    userId: {
                        $regex: search,
                        $options: 'i',
                    },
                },

            ];

        }


        // Role Filter

        if (role) {
            filter.role = role;
        }


        // Active Filter

        if (isActive !== undefined) {
            filter.isActive =
                isActive === 'true';
        }


        // Verified Filter

        if (isVerified !== undefined) {
            filter.isVerified =
                isVerified === 'true';
        }


        const pageNumber = Number(page);
        const limitNumber = Number(limit);


        const skip =
            (pageNumber - 1) *
            limitNumber;


        const totalUsers =
            await this.userModel.countDocuments(
                filter,
            );


        const users =
            await this.userModel
                .find(filter)
                .select('-password')
                .sort({
                    [sortBy]:
                        sortOrder === 'asc'
                            ? 1
                            : -1,
                })
                .skip(skip)
                .limit(limitNumber);


        const totalPages = Math.ceil(
            totalUsers / limitNumber,
        );


        return {

            success: true,

            message:
                'Users fetched successfully.',

            pagination: {

                totalUsers,

                totalPages,

                currentPage:
                    pageNumber,

                limit:
                    limitNumber,

            },

            data: users,

        };

    }

    async getUserById(
        user: any,
        id: string,
    ) {

        // Only Super Admin can access
        if (user.role !== UserRole.SUPER_ADMIN) {
            throw new UnauthorizedException(
                'You are not authorized.',
            );
        }

        const existingUser =
            await this.userModel.findOne({

                $or: [

                    { _id: id },
                    { userId: id },
                    { email: id },
                    { phone: id },

                ],

            }).select('-password');

        if (!existingUser) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        return {

            success: true,
            message:
                'User fetched successfully.',
            data: existingUser,

        };

    }

    async updateUserStatus(
        user: any,
        id: string,
        dto: UpdateUserStatusDto,
    ) {

        // Only Super Admin can update users
        if (user.role !== UserRole.SUPER_ADMIN) {
            throw new UnauthorizedException(
                'You are not authorized.',
            );

        }

        // Find user
        const existingUser = await this.userModel.findOne({

            $or: [

                { _id: id },
                { userId: id },
                { email: id },
                { phone: id },

            ],

        });


        if (!existingUser) {
            throw new BadRequestException(
                'User not found.',
            );

        }

        // Prevent updating Super Admin

        if (
            existingUser.role === UserRole.SUPER_ADMIN
        ) {

            throw new BadRequestException(
                'Super Admin cannot be updated.',
            );

        }

        // Update fields if provided
        if (dto.isActive !== undefined) {
            existingUser.isActive =
                dto.isActive;

        }


        if (dto.isVerified !== undefined) {
            existingUser.isVerified =
                dto.isVerified;

        }


        if (dto.role) {
            existingUser.role =
                dto.role;

        }


        await existingUser.save();
        return {
            success: true,
            message:
                'User status updated successfully.',
            data: existingUser,

        };

    }

    async deleteUser(
        user: any,
        id: string,
    ) {

        if (user.role !== UserRole.SUPER_ADMIN) {
            throw new UnauthorizedException(
                'You are not authorized.',
            );
        }

        const existingUser = await this.userModel.findOne({

            $or: [
                { _id: id },
                { userId: id },
                { email: id },
                { phone: id },
            ],

        });

        if (!existingUser) {
            throw new BadRequestException(
                'User not found.',
            );
        }

        if (
            existingUser.role === UserRole.SUPER_ADMIN
        ) {
            throw new BadRequestException(
                'Super Admin cannot be deleted.',
            );
        }

        if (existingUser.isDeleted) {
            throw new BadRequestException(
                'User is already deleted.',
            );
        }

        existingUser.isActive = false;
        existingUser.isDeleted = true;

        await existingUser.save();

        return {

            success: true,

            message:
                'User deleted successfully.',

        };

    }

    private generateOTP(): string {

        return Math.floor(
            100000 + Math.random() * 900000,
        ).toString();

    }


}

