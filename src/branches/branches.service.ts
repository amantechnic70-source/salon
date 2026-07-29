import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { GetBranchesDto } from './dto/get-branches.dto';
import { UpdateBranchStatusDto } from './dto/update-branch-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';
import { Model } from 'mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Subscription, SubscriptionDocument } from 'src/schemas/subscription.schema';
import { SubscriptionPlan, SubscriptionPlanDocument } from 'src/schemas/subscription-plan.schema';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class BranchesService {

    constructor(

        @InjectModel(Branch.name)
        private readonly branchModel:
            Model<BranchDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Subscription.name)
        private readonly subscriptionModel:
            Model<SubscriptionDocument>,

        @InjectModel(SubscriptionPlan.name)
        private readonly planModel:
            Model<SubscriptionPlanDocument>,

        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,

    ) { }

    async create(
        userId: string,
        dto: CreateBranchDto,
    ) {

        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {
            throw new BadRequestException(
                'User not found.',
            );
        }

        if (user.isDeleted) {
            throw new BadRequestException(
                'User account has been deleted.',
            );
        }

        if (!user.isActive) {
            throw new BadRequestException(
                'User account is inactive.',
            );
        }


        // ==========================================
        // FIND SALON BY OWNER
        // ==========================================

        const salon =
            await this.salonModel.findOne({

                ownerId:
                    user._id,

                isDeleted:
                    false,

            });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found. Please complete salon onboarding first.',
            );
        }


        // ==========================================
        // SYNC USER SALON ID
        // ==========================================

        if (
            !user.salonId ||
            user.salonId.toString() !==
            salon._id.toString()
        ) {

            user.salonId =
                salon._id;

            await user.save();

        }


        // ==========================================
        // CHECK SALON SUBSCRIPTION
        // ==========================================

        if (!user.isSubscriptionActive) {

            throw new BadRequestException(
                'Please activate your subscription plan first.',
            );

        }


        // ==========================================
        // FIND ACTIVE SUBSCRIPTION
        // ==========================================

        const subscription =
            await this.subscriptionModel.findOne({

                userId:
                    user._id,

                status:
                    SubscriptionStatus.ACTIVE,

                isActive:
                    true,

            });

        if (!subscription) {

            throw new BadRequestException(
                'Active subscription not found.',
            );

        }


        // ==========================================
        // FIND PLAN
        // ==========================================

        const plan =
            await this.planModel.findById(
                subscription.planId,
            );

        if (!plan) {

            throw new BadRequestException(
                'Subscription plan not found.',
            );

        }


        // ==========================================
        // CHECK BRANCH LIMIT
        // ==========================================

        const totalBranches =
            await this.branchModel.countDocuments({

                salonId:
                    salon._id,

                isDeleted:
                    false,

            });

        if (
            totalBranches >=
            plan.maxBranches
        ) {

            throw new BadRequestException(
                `You can create only ${plan.maxBranches} branches in your current plan.`,
            );

        }


        // ==========================================
        // GENERATE BRANCH ID
        // ==========================================

        const totalBranch =
            await this.branchModel
                .countDocuments();

        const branchId =
            `BR${String(
                totalBranch + 1,
            ).padStart(6, '0')}`;


        // ==========================================
        // CREATE BRANCH
        // ==========================================

        const branch =
            await this.branchModel.create({

                branchId,

                salonId:
                    salon._id,

                ...dto,

            });


        return {

            success: true,

            message:
                'Branch created successfully.',

            data:
                branch,

        };

    }

    async getAll(
        userId: string,
        query: GetBranchesDto,
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

        if (user.isDeleted) {
            throw new BadRequestException(
                'User account has been deleted.',
            );
        }

        if (!user.isActive) {
            throw new BadRequestException(
                'User account is inactive.',
            );
        }



        const salon =
            await this.salonModel.findOne({

                ownerId:
                    user._id,

                isDeleted:
                    false,

            });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found. Please complete salon onboarding first.',
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

        const sort: any = {
            [query.sortBy || 'createdAt']:
                query.sortOrder === 'asc' ? 1 : -1,
        };

        const totalBranches =
            await this.branchModel.countDocuments(
                filter,
            );

        const branches = await this.branchModel
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        return {
            success: true,
            message:
                'Branches fetched successfully.',
            data: branches,
            pagination: {
                total: totalBranches,
                page,
                limit,
                totalPages: Math.ceil(
                    totalBranches / limit,
                ),
            },
        };

    }

    async getById(
        userId: string,
        id: string,
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

        if (user.isDeleted) {
            throw new BadRequestException(
                'User account has been deleted.',
            );
        }

        if (!user.isActive) {
            throw new BadRequestException(
                'User account is inactive.',
            );
        }



        const salon =
            await this.salonModel.findOne({

                ownerId:
                    user._id,

                isDeleted:
                    false,

            });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found. Please complete salon onboarding first.',
            );
        }

        const branch = await this.branchModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!branch) {
            throw new BadRequestException(
                'Branch not found.',
            );
        }

        return {
            success: true,
            data: branch,
        };

    }

    async update(
        userId: string,
        id: string,
        dto: UpdateBranchDto,
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

        if (user.isDeleted) {
            throw new BadRequestException(
                'User account has been deleted.',
            );
        }

        if (!user.isActive) {
            throw new BadRequestException(
                'User account is inactive.',
            );
        }



        const salon =
            await this.salonModel.findOne({

                ownerId:
                    user._id,

                isDeleted:
                    false,

            });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found. Please complete salon onboarding first.',
            );
        }
        const branch = await this.branchModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!branch) {
            throw new BadRequestException(
                'Branch not found.',
            );
        }

        Object.assign(
            branch,
            dto,
        );

        await branch.save();

        return {
            success: true,
            message: 'Branch updated successfully.',
            data: branch,
        };

    }

    async deleteBranch(
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

        const branch = await this.branchModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!branch) {
            throw new BadRequestException(
                'Branch not found.',
            );
        }

        branch.isDeleted = true;

        await branch.save();

        return {
            success: true,
            message: 'Branch deleted successfully.',
        };

    }

    async searchBranches(
        query: GetBranchesDto,
    ) {

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

        const branches = await this.branchModel.find(
            filter,
        );

        return {
            success: true,
            data: branches,
        };

    }

    async getBranchesByCity(
        city: string,
    ) {

        const branches = await this.branchModel.find({
            city,
            isDeleted: false,
            isActive: true,
        });

        return {
            success: true,
            data: branches,
        };

    }

    async getBranchesBySalon(
        salonId: string,
    ) {

        const branches = await this.branchModel.find({
            salonId,
            isDeleted: false,
            isActive: true,
        });

        return {
            success: true,
            data: branches,
        };

    }

    async getAllBranchesByAdmin(
        user: any,
        query: GetBranchesDto,
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

        const total =
            await this.branchModel.countDocuments(
                filter,
            );

        const branches =
            await this.branchModel.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({
                    createdAt: -1,
                });

        return {
            success: true,
            data: branches,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(
                    total / limit,
                ),
            },
        };

    }

    async updateBranchStatus(
        user: any,
        id: string,
        dto: UpdateBranchStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );
        }

        const branch =
            await this.branchModel.findById(
                id,
            );

        if (!branch) {
            throw new BadRequestException(
                'Branch not found.',
            );
        }

        Object.assign(
            branch,
            dto,
        );

        await branch.save();

        return {
            success: true,
            message:
                'Branch status updated successfully.',
            data: branch,
        };

    }

    async deleteBranchByAdmin(
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

        const branch =
            await this.branchModel.findById(
                id,
            );

        if (!branch) {
            throw new BadRequestException(
                'Branch not found.',
            );
        }

        branch.isDeleted = true;

        await branch.save();

        return {
            success: true,
            message:
                'Branch deleted successfully.',
        };

    }

}