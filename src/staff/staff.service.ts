import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { GetStaffDto } from './dto/get-staff.dto';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { Model } from 'mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';
import { Subscription, SubscriptionDocument } from 'src/schemas/subscription.schema';
import { SubscriptionPlan, SubscriptionPlanDocument } from 'src/schemas/subscription-plan.schema';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class StaffService {

    constructor(
        @InjectModel(Staff.name)
        private readonly staffModel: Model<StaffDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel: Model<SalonDocument>,

        @InjectModel(Branch.name)
        private readonly branchModel: Model<BranchDocument>,

        @InjectModel(Subscription.name)
        private readonly subscriptionModel: Model<SubscriptionDocument>,

        @InjectModel(SubscriptionPlan.name)
        private readonly planModel: Model<SubscriptionPlanDocument>,
    ) { }

    async create(
        userId: string,
        dto: CreateStaffDto,
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

        if (!salon.isSubscriptionActive) {
            throw new BadRequestException(
                'Please activate your subscription plan first.',
            );
        }

        const branch = await this.branchModel.findOne({
            _id: dto.branchId,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!branch) {
            throw new BadRequestException(
                'Branch not found.',
            );
        }

        const subscription =
            await this.subscriptionModel.findOne({
                salonId: salon._id,
                status: SubscriptionStatus.ACTIVE,
            });

        if (!subscription) {
            throw new BadRequestException(
                'Active subscription not found.',
            );
        }

        const plan =
            await this.planModel.findById(
                subscription.planId,
            );

        if (!plan) {
            throw new BadRequestException(
                'Subscription plan not found.',
            );
        }

        const totalStaff =
            await this.staffModel.countDocuments({
                salonId: salon._id,
                isDeleted: false,
            });

        if (
            totalStaff >=
            plan.maxStaff
        ) {
            throw new BadRequestException(
                `You can create only ${plan.maxStaff} staff members in your current plan.`,
            );
        }

        const totalStaffCount =
            await this.staffModel.countDocuments();

        const staffId =
            `STF${String(
                totalStaffCount + 1,
            ).padStart(6, '0')}`;

        const staff = await this.staffModel.create({
            staffId,
            salonId: salon._id,
            branchId: dto.branchId,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            profileImage: dto.profileImage,
            designation: dto.designation,
            salary: dto.salary,
            commissionPercentage: dto.commissionPercentage,
            experience: dto.experience,
            joiningDate: dto.joiningDate,
            gender: dto.gender,
            description: dto.description,
        });

        return {
            success: true,
            message:
                'Staff created successfully.',
            data: staff,
        };

    }

    async getAll(
        userId: string,
        query: GetStaffDto,
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

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {
            salonId: salon._id,
            isDeleted: false,
        };

        if (query.search) {
            filter.name = {
                $regex: query.search,
                $options: 'i',
            };
        }

        if (query.branchId) {
            filter.branchId = query.branchId;
        }

        const sort: any = {
            [query.sortBy || 'createdAt']:
                query.sortOrder === 'asc'
                    ? 1
                    : -1,
        };

        const totalStaff =
            await this.staffModel.countDocuments(
                filter,
            );

        const staff = await this.staffModel
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        return {
            success: true,
            message:
                'Staff fetched successfully.',
            data: staff,
            pagination: {
                total: totalStaff,
                page,
                limit,
                totalPages: Math.ceil(
                    totalStaff / limit,
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

        const staff = await this.staffModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!staff) {
            throw new BadRequestException(
                'Staff not found.',
            );
        }

        return {
            success: true,
            data: staff,
        };

    }

    async update(
        userId: string,
        id: string,
        dto: UpdateStaffDto,
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

        const staff = await this.staffModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!staff) {
            throw new BadRequestException(
                'Staff not found.',
            );
        }

        if (dto.branchId) {

            const branch =
                await this.branchModel.findOne({
                    _id: dto.branchId,
                    salonId: salon._id,
                    isDeleted: false,
                });

            if (!branch) {
                throw new BadRequestException(
                    'Branch not found.',
                );
            }

        }

        Object.assign(
            staff,
            dto,
        );

        await staff.save();

        return {
            success: true,
            message:
                'Staff updated successfully.',
            data: staff,
        };

    }

    async deleteStaff(
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

        const staff = await this.staffModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!staff) {
            throw new BadRequestException(
                'Staff not found.',
            );
        }

        staff.isDeleted = true;

        await staff.save();

        return {
            success: true,
            message: 'Staff deleted successfully.',
        };

    }

    async getStaffByBranch(
        branchId: string,
    ) {

        const branch = await this.branchModel.findOne({
            _id: branchId,
            isDeleted: false,
            isActive: true,
        });

        if (!branch) {
            throw new BadRequestException(
                'Branch not found.',
            );
        }

        const staff = await this.staffModel.find({
            branchId,
            isDeleted: false,
            isActive: true,
        });

        return {
            success: true,
            message:
                'Staff fetched successfully.',
            data: staff,
        };

    }

    async searchStaff(
        query: GetStaffDto,
    ) {

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {
            isDeleted: false,
            isActive: true,
        };

        if (query.search) {
            filter.name = {
                $regex: query.search,
                $options: 'i',
            };
        }

        if (query.branchId) {
            filter.branchId = query.branchId;
        }

        const sort: any = {
            [query.sortBy || 'createdAt']:
                query.sortOrder === 'asc'
                    ? 1
                    : -1,
        };

        const totalStaff =
            await this.staffModel.countDocuments(
                filter,
            );

        const staff = await this.staffModel
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        return {
            success: true,
            message:
                'Staff fetched successfully.',
            data: staff,
            pagination: {
                total: totalStaff,
                page,
                limit,
                totalPages: Math.ceil(
                    totalStaff / limit,
                ),
            },
        };

    }

    async getAllStaffByAdmin(
        user: any,
        query: GetStaffDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );
        }

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};

        if (query.search) {
            filter.name = {
                $regex: query.search,
                $options: 'i',
            };
        }

        if (query.branchId) {
            filter.branchId = query.branchId;
        }

        const sort: any = {
            [query.sortBy || 'createdAt']:
                query.sortOrder === 'asc'
                    ? 1
                    : -1,
        };

        const totalStaff =
            await this.staffModel.countDocuments(
                filter,
            );

        const staff = await this.staffModel
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('salonId')
            .populate('branchId');

        return {
            success: true,
            message:
                'Staff fetched successfully.',
            data: staff,
            pagination: {
                total: totalStaff,
                page,
                limit,
                totalPages: Math.ceil(
                    totalStaff / limit,
                ),
            },
        };

    }

    async updateStaffStatus(
        user: any,
        id: string,
        dto: UpdateStaffStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );
        }

        const staff =
            await this.staffModel.findById(
                id,
            );

        if (!staff) {
            throw new BadRequestException(
                'Staff not found.',
            );
        }

        Object.assign(
            staff,
            dto,
        );

        await staff.save();

        return {
            success: true,
            message:
                'Staff status updated successfully.',
            data: staff,
        };

    }

    async deleteStaffByAdmin(
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

        const staff =
            await this.staffModel.findById(
                id,
            );

        if (!staff) {
            throw new BadRequestException(
                'Staff not found.',
            );
        }

        staff.isDeleted = true;

        await staff.save();

        return {
            success: true,
            message:
                'Staff deleted successfully.',
        };

    }

}