import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { GetCouponsDto } from './dto/get-coupons.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { UpdateCouponStatusDto } from './dto/update-coupon-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon, CouponDocument } from 'src/schemas/coupon.schema';
import { Model } from 'mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class CouponsService {

    constructor(
        @InjectModel(Coupon.name)
        private readonly couponModel:
            Model<CouponDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,
    ) { }

    async create(
        userId: string,
        dto: CreateCouponDto,
    ) {

        const salon = await this.salonModel.findOne({

            ownerId: userId,

            isDeleted: false,

        });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }


        // Prevent duplicate coupon code for same salon

        const existingCoupon =
            await this.couponModel.findOne({

                salonId: salon._id,

                code: dto.code.toUpperCase(),

                isDeleted: false,

            });

        if (existingCoupon) {

            throw new BadRequestException(
                'Coupon code already exists.',
            );

        }


        // Generate Coupon ID

        const totalCoupons =
            await this.couponModel
                .countDocuments();


        const couponId =
            `COUPON${String(
                totalCoupons + 1,
            ).padStart(6, '0')}`;


        // Create Coupon

        const coupon =
            await this.couponModel.create({

                couponId,

                salonId: salon._id,

                ...dto,

                code:
                    dto.code.toUpperCase(),

            });


        return {

            success: true,

            message:
                'Coupon created successfully.',

            data: coupon,

        };

    }

    async getAll(
        userId: string,
        query: GetCouponsDto,
    ) {

        const salon = await this.salonModel.findOne({

            ownerId: userId,

            isDeleted: false,

        });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;


        const filter: any = {

            salonId: salon._id,

            isDeleted: false,

        };


        if (query.search) {

            filter.code = {

                $regex: query.search,

                $options: 'i',

            };

        }


        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };


        const totalCoupons =
            await this.couponModel
                .countDocuments(
                    filter,
                );


        const coupons =
            await this.couponModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit);


        return {

            success: true,

            message:
                'Coupons fetched successfully.',

            data: coupons,

            pagination: {

                total: totalCoupons,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalCoupons / limit,
                    ),

            },

        };

    }

    async getById(
        userId: string,
        id: string,
    ) {

        const salon = await this.salonModel.findOne({
            ownerId: userId,
            isDeleted: false,
        });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        const coupon = await this.couponModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!coupon) {
            throw new BadRequestException(
                'Coupon not found.',
            );
        }

        return {
            success: true,
            message: 'Coupon fetched successfully.',
            data: coupon,
        };

    }

    async update(
        userId: string,
        id: string,
        dto: UpdateCouponDto,
    ) {

        const salon = await this.salonModel.findOne({
            ownerId: userId,
            isDeleted: false,
        });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        const coupon = await this.couponModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!coupon) {
            throw new BadRequestException(
                'Coupon not found.',
            );
        }

        if (dto.code) {
            const existingCoupon =
                await this.couponModel.findOne({
                    salonId: salon._id,
                    code: dto.code.trim().toUpperCase(),
                    _id: { $ne: id },
                    isDeleted: false,
                });

            if (existingCoupon) {
                throw new BadRequestException(
                    'Coupon code already exists.',
                );
            }

            dto.code =
                dto.code.trim().toUpperCase();
        }

        Object.assign(
            coupon,
            dto,
        );

        await coupon.save();

        return {
            success: true,
            message: 'Coupon updated successfully.',
            data: coupon,
        };

    }

    async deleteCoupon(
        userId: string,
        id: string,
    ) {

        const salon = await this.salonModel.findOne({
            ownerId: userId,
            isDeleted: false,
        });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        const coupon = await this.couponModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!coupon) {
            throw new BadRequestException(
                'Coupon not found.',
            );
        }

        coupon.isDeleted = true;
        coupon.isActive = false;

        await coupon.save();

        return {
            success: true,
            message: 'Coupon deleted successfully.',
        };

    }

    async applyCoupon(
        dto: ApplyCouponDto,
    ) {

        const coupon =
            await this.couponModel.findOne({

                code:
                    dto.code.trim().toUpperCase(),

                isActive: true,

                isDeleted: false,

            });

        if (!coupon) {

            throw new BadRequestException(
                'Invalid coupon code.',
            );

        }

        if (
            new Date(coupon.expiryDate)
            < new Date()
        ) {

            throw new BadRequestException(
                'Coupon has expired.',
            );

        }

        if (
            coupon.usedCount >=
            coupon.usageLimit
        ) {

            throw new BadRequestException(
                'Coupon usage limit exceeded.',
            );

        }

        if (
            dto.amount <
            coupon.minimumAmount
        ) {

            throw new BadRequestException(

                `Minimum order amount should be ₹${coupon.minimumAmount}.`

            );

        }

        let discountAmount = 0;


        // FLAT DISCOUNT

        if (
            coupon.discountType ===
            'FLAT'
        ) {

            discountAmount =
                coupon.discountValue;

        }


        // PERCENTAGE DISCOUNT

        if (
            coupon.discountType ===
            'PERCENTAGE'
        ) {

            discountAmount =
                (dto.amount *
                    coupon.discountValue)
                / 100;


            // MAXIMUM DISCOUNT

            if (
                discountAmount >
                coupon.maximumDiscount
            ) {

                discountAmount =
                    coupon.maximumDiscount;

            }

        }


        const finalAmount =
            dto.amount -
            discountAmount;


        return {

            success: true,

            message:
                'Coupon applied successfully.',

            data: {

                couponCode:
                    coupon.code,

                originalAmount:
                    dto.amount,

                discountAmount,

                finalAmount,

            },

        };

    }

    async searchCoupons(
        query: GetCouponsDto,
    ) {

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;


        const filter: any = {

            isDeleted: false,

            isActive: true,

        };


        if (query.search) {

            filter.code = {

                $regex: query.search,

                $options: 'i',

            };

        }


        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };


        const totalCoupons =
            await this.couponModel
                .countDocuments(
                    filter,
                );


        const coupons =
            await this.couponModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(
                    'salonId',
                );


        return {

            success: true,

            message:
                'Coupons fetched successfully.',

            data: coupons,

            pagination: {

                total:
                    totalCoupons,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalCoupons /
                        limit,
                    ),

            },

        };

    }

    async getActiveCoupons() {

        const coupons =
            await this.couponModel.find({

                isActive: true,

                isDeleted: false,

                expiryDate: {
                    $gte: new Date(),
                },

            }).populate(
                'salonId',
            );


        return {

            success: true,

            message:
                'Active coupons fetched successfully.',

            data: coupons,

        };

    }

    async getAllByAdmin(
        user: any,
        query: GetCouponsDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );
        }

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter: any = {};

        if (query.search) {

            filter.code = {

                $regex: query.search,

                $options: 'i',

            };

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalCoupons =
            await this.couponModel
                .countDocuments(
                    filter,
                );

        const coupons =
            await this.couponModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(
                    'salonId',
                );

        return {

            success: true,

            message:
                'Coupons fetched successfully.',

            data: coupons,

            pagination: {

                total:
                    totalCoupons,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalCoupons /
                        limit,
                    ),

            },

        };

    }

    async updateCouponStatus(
        user: any,
        id: string,
        dto: UpdateCouponStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );
        }

        const coupon =
            await this.couponModel.findById(
                id,
            );

        if (!coupon) {

            throw new BadRequestException(
                'Coupon not found.',
            );

        }

        Object.assign(
            coupon,
            dto,
        );

        await coupon.save();

        return {

            success: true,

            message:
                'Coupon status updated successfully.',

            data: coupon,

        };

    }

    async deleteCouponByAdmin(
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

        const coupon =
            await this.couponModel.findById(
                id,
            );

        if (!coupon) {

            throw new BadRequestException(
                'Coupon not found.',
            );

        }

        coupon.isDeleted = true;
        coupon.isActive = false;

        await coupon.save();

        return {

            success: true,

            message:
                'Coupon deleted successfully.',

        };

    }

}