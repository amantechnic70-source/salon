import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import {
    Salon,
    SalonDocument,
} from 'src/schemas/salon.schema';

import {
    User,
    UserDocument,
} from 'src/schemas/user.schema';

import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { GetSalonsDto } from './dto/get-salons.dto';
import { UpdateSalonStatusDto } from './dto/update-salon-status.dto';

import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class SalonsService {

    constructor(

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,

    ) { }

    async create(
        userId: string,
        dto: CreateSalonDto,
    ) {

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {
            throw new BadRequestException(
                'User not found.',
            );
        }

        if (
            user.role !== UserRole.SALON_OWNER
        ) {
            throw new UnauthorizedException(
                'Only salon owners can create salons.',
            );
        }

        const existingSalon =
            await this.salonModel.findOne({
                ownerId: user._id,
            });

        if (existingSalon) {
            throw new BadRequestException(
                'Salon already exists.',
            );
        }

        const totalSalon = await this.salonModel.countDocuments();

        const salonId =
            `SAL${String(
                totalSalon + 1,
            ).padStart(6, '0')}`;

        const salon =
            await this.salonModel.create({
                salonId,
                ownerId: user._id,
                ...dto,
                isVerified: false,
                isActive: true,
                isDeleted: false,
                isSubscriptionActive: false,

            });

        user.salonId = salon._id as Types.ObjectId;
        await user.save();

        return {
            success: true,
            message: 'Salon created successfully.',
            data: salon,
        };

    }

    async profile(
        userId: string,
    ) {

        const salon =
            await this.salonModel
                .findOne({
                    ownerId: userId,
                });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        return {

            success: true,

            data: salon,

        };

    }

    async update(
        userId: string,
        dto: UpdateSalonDto,
    ) {

        const salon =
            await this.salonModel.findOne({
                ownerId: userId,
            });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        Object.assign(
            salon,
            dto,
        );

        await salon.save();

        return {

            success: true,

            message:
                'Salon updated successfully.',

            data: salon,

        };

    }

    async deleteSalon(
        userId: string,
    ) {

        const salon =
            await this.salonModel.findOne({
                ownerId: userId,
            });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        salon.isActive = false;
        salon.isDeleted = true;

        await salon.save();

        return {

            success: true,

            message:
                'Salon deleted successfully.',

        };

    }

    async getAllSalons(
        query: GetSalonsDto,
    ) {

        const {

            page = '1',

            limit = '10',

            search,

            city,

            sortBy = 'createdAt',

            sortOrder = 'desc',

        } = query;


        const filter: any = {

            isActive: true,

            isVerified: true,

            isDeleted: false,

        };


        if (search) {

            filter.name = {
                $regex: search,
                $options: 'i',
            };

        }


        if (city) {
            filter.city = city;
        }


        const salons =
            await this.salonModel
                .find(filter)
                .sort({
                    [sortBy]:
                        sortOrder === 'asc'
                            ? 1
                            : -1,
                })
                .skip(
                    (Number(page) - 1)
                    * Number(limit),
                )
                .limit(
                    Number(limit),
                );


        return {

            success: true,

            data: salons,

        };

    }

    async searchSalons(
        query: GetSalonsDto,
    ) {

        return this.getAllSalons(
            query,
        );

    }

    async getSalonByCity(
        city: string,
    ) {

        return await this.salonModel.find({

            city,

            isVerified: true,

            isActive: true,

            isDeleted: false,

        });

    }

    async getSalonById(
        id: string,
    ) {

        const salon =
            await this.salonModel.findOne({

                $or: [

                    {
                        salonId: id,
                    },

                    {
                        _id:
                            Types.ObjectId.isValid(id)
                                ? id
                                : null,
                    },

                ],

                isVerified: true,

                isActive: true,

                isDeleted: false,

            });


        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }


        return {

            success: true,

            data: salon,

        };

    }

    async getAllSalonByAdmin(
        user: any,
        query: GetSalonsDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        return this.salonModel.find();

    }

    async updateSalonStatus(
        user: any,
        id: string,
        dto: UpdateSalonStatusDto,
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
            await this.salonModel.findOne({
                salonId: id,
            });


        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }


        Object.assign(
            salon,
            dto,
        );

        await salon.save();


        return {

            success: true,

            message:
                'Salon updated successfully.',

            data: salon,

        };

    }

    async deleteSalonByAdmin(
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
            await this.salonModel.findOne({
                salonId: id,
            });


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

        };

    }
}
