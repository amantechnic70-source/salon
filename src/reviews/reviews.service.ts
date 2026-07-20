import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from 'src/schemas/review.schema';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import { Appointment, AppointmentDocument } from 'src/schemas/appointment.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class ReviewsService {

    constructor(
        @InjectModel(Review.name)
        private readonly reviewModel:
            Model<ReviewDocument>,

        @InjectModel(Customer.name)
        private readonly customerModel:
            Model<CustomerDocument>,

        @InjectModel(Appointment.name)
        private readonly appointmentModel:
            Model<AppointmentDocument>,
    ) { }

    async create(
        userId: string,
        dto: CreateReviewDto,
    ) {

        const customer =
            await this.customerModel.findOne({

                _id: userId,

                isDeleted: false,

            });

        if (!customer) {

            throw new BadRequestException(
                'Customer not found.',
            );

        }

        const appointment =
            await this.appointmentModel.findOne({

                _id: dto.appointmentId,

                customerId:
                    customer._id,

                isDeleted: false,

            });

        if (!appointment) {

            throw new BadRequestException(
                'Appointment not found.',
            );

        }

        if (!appointment.isCompleted) {

            throw new BadRequestException(
                'Review can only be submitted after appointment completion.',
            );

        }

        const existingReview =
            await this.reviewModel.findOne({

                appointmentId:
                    appointment._id,

                customerId:
                    customer._id,

                isDeleted:
                    false,

            });

        if (existingReview) {

            throw new BadRequestException(
                'Review already submitted.',
            );

        }

        const totalReviews =
            await this.reviewModel
                .countDocuments();

        const reviewId =
            `REV${String(
                totalReviews + 1,
            ).padStart(6, '0')}`;

        const review =
            await this.reviewModel.create({

                reviewId,

                customerId:
                    customer._id,

                appointmentId:
                    appointment._id,

                salonId:
                    appointment.salonId,

                staffId:
                    appointment.staffId,

                serviceId:
                    appointment.serviceIds?.[0],

                rating:
                    dto.rating,

                review:
                    dto.review,

                isApproved:
                    false,

                isActive:
                    true,

                isDeleted:
                    false,

            });

        return {

            success: true,

            message:
                'Review submitted successfully.',

            data:
                review,

        };

    }

    async getAll(
        userId: string,
        query: GetReviewsDto,
    ) {

        const customer =
            await this.customerModel.findOne({

                _id: userId,

                isDeleted: false,

            });

        if (!customer) {

            throw new BadRequestException(
                'Customer not found.',
            );

        }

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter: any = {

            customerId:
                customer._id,

            isDeleted:
                false,

        };

        if (query.search) {

            filter.review = {

                $regex:
                    query.search,

                $options:
                    'i',

            };

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalReviews =
            await this.reviewModel
                .countDocuments(
                    filter,
                );

        const reviews =
            await this.reviewModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(
                    'appointmentId',
                )
                .populate(
                    'customerId',
                )
                .populate(
                    'salonId',
                )
                .populate(
                    'staffId',
                )
                .populate(
                    'serviceId',
                );

        return {
            success: true,
            message:
                'Reviews fetched successfully.',
            data:
                reviews,
            pagination: {
                total:
                    totalReviews,

                page,
                limit,
                totalPages:
                    Math.ceil(
                        totalReviews /
                        limit,
                    ),

            },

        };

    }

    async getById(
        userId: string,
        id: string,
    ) {

        const customer =
            await this.customerModel.findOne({

                _id: userId,

                isDeleted: false,

            });

        if (!customer) {

            throw new BadRequestException(
                'Customer not found.',
            );

        }

        const review =
            await this.reviewModel
                .findOne({

                    _id: id,

                    customerId:
                        customer._id,

                    isDeleted:
                        false,

                })

                .populate(
                    'appointmentId',
                )

                .populate(
                    'customerId',
                )

                .populate(
                    'salonId',
                )

                .populate(
                    'staffId',
                )

                .populate(
                    'serviceId',
                );

        if (!review) {

            throw new BadRequestException(
                'Review not found.',
            );

        }

        return {
            success: true,
            message:
                'Review fetched successfully.',
            data:
                review,

        };

    }

    async update(
        userId: string,
        id: string,
        dto: UpdateReviewDto,
    ) {

        const customer =
            await this.customerModel.findOne({

                _id: userId,

                isDeleted: false,

            });

        if (!customer) {

            throw new BadRequestException(
                'Customer not found.',
            );

        }

        const review =
            await this.reviewModel.findOne({

                _id: id,

                customerId:
                    customer._id,

                isDeleted:
                    false,

            });

        if (!review) {

            throw new BadRequestException(
                'Review not found.',
            );

        }

        if (review.isApproved) {

            throw new BadRequestException(
                'Approved review cannot be updated.',
            );

        }

        Object.assign(
            review,
            dto,
        );

        await review.save();

        return {

            success: true,

            message:
                'Review updated successfully.',

            data:
                review,

        };

    }

    async deleteReview(
        userId: string,
        id: string,
    ) {
        const customer =
            await this.customerModel.findOne({

                _id: userId,

                isDeleted: false,

            });

        if (!customer) {

            throw new BadRequestException(
                'Customer not found.',
            );

        }

        const review =
            await this.reviewModel.findOne({

                _id: id,

                customerId:
                    customer._id,

                isDeleted:
                    false,

            });

        if (!review) {

            throw new BadRequestException(
                'Review not found.',
            );

        }

        if (review.isApproved) {

            throw new BadRequestException(
                'Approved review cannot be deleted.',
            );

        }

        review.isDeleted = true;
        review.isActive = false;
        await review.save();
        return {
            success: true,
            message:
                'Review deleted successfully.',

        };

    }

    async getSalonReviews(
        salonId: string,
    ) {
        const reviews =
            await this.reviewModel
                .find({
                    salonId,
                    isApproved: true,
                    isActive: true,
                    isDeleted: false,

                })

                .sort({

                    createdAt: -1,

                })
                .populate(
                    'customerId',
                )

                .populate(
                    'appointmentId',
                );

        return {
            success: true,
            message:
                'Salon reviews fetched successfully.',
            data:
                reviews,

        };

    }

    async getStaffReviews(
        staffId: string,
    ) {

        const reviews =
            await this.reviewModel
                .find({
                    staffId,
                    isApproved: true,
                    isActive: true,
                    isDeleted: false,

                })

                .sort({

                    createdAt: -1,

                })

                .populate(
                    'customerId',
                )

                .populate(
                    'appointmentId',
                );

        return {
            success: true,
            message:
                'Staff reviews fetched successfully.',
            data:
                reviews,

        };

    }

    async getServiceReviews(
        serviceId: string,
    ) {
        const reviews =
            await this.reviewModel
                .find({
                    serviceId,
                    isApproved: true,
                    isActive: true,
                    isDeleted: false,
                })
                .sort({
                    createdAt: -1,

                })
                .populate(
                    'customerId',
                )
                .populate(
                    'appointmentId',
                );

        return {
            success: true,
            message:
                'Service reviews fetched successfully.',
            data:
                reviews,

        };

    }

    async searchReviews(
        query: GetReviewsDto,
    ) {

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter: any = {
            isApproved: true,
            isActive: true,
            isDeleted: false,

        };

        if (query.search) {
            filter.review = {
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

        const totalReviews =
            await this.reviewModel
                .countDocuments(
                    filter,
                );

        const reviews =
            await this.reviewModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(
                    'customerId',
                )
                .populate(
                    'appointmentId',
                )
                .populate(
                    'salonId',
                )
                .populate(
                    'staffId',
                )
                .populate(
                    'serviceId',
                );

        return {

            success: true,
            message:
                'Reviews fetched successfully.',
            data:
                reviews,
            pagination: {
                total:
                    totalReviews,
                page,
                limit,
                totalPages:
                    Math.ceil(
                        totalReviews /
                        limit,
                    ),

            },

        };

    }

    async getAllByAdmin(
        user: any,
        query: GetReviewsDto,
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
            filter.review = {
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

        const totalReviews =
            await this.reviewModel
                .countDocuments(
                    filter,
                );

        const reviews =
            await this.reviewModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(
                    'customerId',
                )
                .populate(
                    'appointmentId',
                )
                .populate(
                    'salonId',
                )
                .populate(
                    'staffId',
                )
                .populate(
                    'serviceId',
                );

        return {
            success: true,
            message:
                'Reviews fetched successfully.',
            data:
                reviews,
            pagination: {
                total:
                    totalReviews,
                page,
                limit,
                totalPages:
                    Math.ceil(
                        totalReviews /
                        limit,
                    ),

            },

        };

    }

    async updateReviewStatus(
        user: any,
        id: string,
        dto: UpdateReviewStatusDto,
    ) {
        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }
        const review =
            await this.reviewModel.findById(
                id,
            );

        if (!review) {
            throw new BadRequestException(
                'Review not found.',
            );

        }

        Object.assign(
            review,
            dto,
        );

        await review.save();
        return {
            success: true,
            message:
                'Review status updated successfully.',
            data:
                review,

        };

    }

    async deleteReviewByAdmin(
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

        const review =
            await this.reviewModel.findById(
                id,
            );

        if (!review) {

            throw new BadRequestException(
                'Review not found.',
            );

        }

        review.isDeleted = true;
        review.isActive = false;
        await review.save();
        return {
            success: true,
            message:
                'Review deleted successfully.',

        };

    }

}