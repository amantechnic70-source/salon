import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { GetMembershipPlansDto } from './dto/get-membership-plans.dto';
import { AssignMembershipDto } from './dto/assign-membership.dto';
import { UpdateMembershipStatusDto } from './dto/update-membership-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MembershipPlan, MembershipPlanDocument } from 'src/schemas/membership-plan.schema';
import { Model } from 'mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Membership, MembershipDocument } from 'src/schemas/membership.schema';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class MembershipsService {

    constructor(
        @InjectModel(Membership.name)
        private readonly membershipModel:
            Model<MembershipDocument>,

        @InjectModel(MembershipPlan.name)
        private readonly membershipPlanModel:
            Model<MembershipPlanDocument>,

        @InjectModel(Customer.name)
        private readonly customerModel:
            Model<CustomerDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,
    ) { }

    async createPlan(
        userId: string,
        dto: CreateMembershipPlanDto,
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

        const totalPlans =
            await this.membershipPlanModel
                .countDocuments();

        const membershipPlanId =
            `MEMPLAN${String(
                totalPlans + 1,
            ).padStart(6, '0')}`;

        const membershipPlan =
            await this.membershipPlanModel
                .create({

                    membershipPlanId,

                    salonId: salon._id,

                    ...dto,

                });

        return {

            success: true,

            message:
                'Membership plan created successfully.',

            data: membershipPlan,

        };

    }


    async getPlans(
        userId: string,
        query: GetMembershipPlansDto,
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

            filter.name = {

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

        const totalPlans =
            await this.membershipPlanModel
                .countDocuments(
                    filter,
                );

        const plans =
            await this.membershipPlanModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit);

        return {

            success: true,

            message:
                'Membership plans fetched successfully.',

            data: plans,

            pagination: {

                total: totalPlans,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalPlans / limit,
                    ),

            },

        };

    }


    async updatePlan(
        userId: string,
        id: string,
        dto: UpdateMembershipPlanDto,
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

        const membershipPlan =
            await this.membershipPlanModel.findOne({

                _id: id,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!membershipPlan) {

            throw new BadRequestException(
                'Membership plan not found.',
            );

        }

        Object.assign(
            membershipPlan,
            dto,
        );

        await membershipPlan.save();

        return {

            success: true,

            message:
                'Membership plan updated successfully.',

            data: membershipPlan,

        };

    }


    async deletePlan(
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

        const membershipPlan =
            await this.membershipPlanModel.findOne({

                _id: id,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!membershipPlan) {

            throw new BadRequestException(
                'Membership plan not found.',
            );

        }

        membershipPlan.isDeleted = true;

        membershipPlan.isActive = false;

        await membershipPlan.save();

        return {

            success: true,

            message:
                'Membership plan deleted successfully.',

        };

    }


    async assignMembership(
        userId: string,
        dto: AssignMembershipDto,
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

        const customer =
            await this.customerModel.findOne({

                _id: dto.customerId,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!customer) {

            throw new BadRequestException(
                'Customer not found.',
            );

        }

        const membershipPlan =
            await this.membershipPlanModel.findOne({

                _id: dto.membershipPlanId,

                salonId: salon._id,

                isDeleted: false,

                isActive: true,

            });

        if (!membershipPlan) {

            throw new BadRequestException(
                'Membership plan not found.',
            );

        }


        // Check Existing Active Membership

        const existingMembership =
            await this.membershipModel.findOne({

                customerId: customer._id,

                isActive: true,

            });

        if (existingMembership) {

            throw new BadRequestException(
                'Customer already has an active membership.',
            );

        }


        // Generate Membership ID

        const totalMemberships =
            await this.membershipModel.countDocuments();


        const membershipId =
            `MEM${String(
                totalMemberships + 1,
            ).padStart(6, '0')}`;


        // Dates

        const startDate =
            new Date();


        const expiryDate =
            new Date();


        expiryDate.setDate(

            expiryDate.getDate()

            + membershipPlan.durationInDays,

        );


        // Create Membership

        const membership =
            await this.membershipModel.create({

                membershipId,

                customerId:
                    customer._id,

                membershipPlanId:
                    membershipPlan._id,

                amount:
                    membershipPlan.amount,

                startDate,

                expiryDate,

                status:
                    'ACTIVE',

                isActive:
                    true,

            });


        // Loyalty Points

        customer.loyaltyPoints +=
            membershipPlan.loyaltyPoints;

        await customer.save();


        return {

            success: true,

            message:
                'Membership assigned successfully.',

            data: membership,

        };

    }


    async getCustomerMembership(
        userId: string,
        customerId: string,
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

        const customer =
            await this.customerModel.findOne({

                _id: customerId,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!customer) {

            throw new BadRequestException(
                'Customer not found.',
            );

        }

        const membership =
            await this.membershipModel.findOne({

                customerId: customer._id,

                isActive: true,

            }).populate(
                'membershipPlanId',
            );

        if (!membership) {

            throw new BadRequestException(
                'Membership not found.',
            );

        }

        return {

            success: true,

            message:
                'Customer membership fetched successfully.',

            data: membership,

        };

    }


    async searchMemberships(
        query: GetMembershipPlansDto,
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

            filter.name = {

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

        const totalPlans =
            await this.membershipPlanModel
                .countDocuments(
                    filter,
                );

        const plans =
            await this.membershipPlanModel
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
                'Membership plans fetched successfully.',

            data: plans,

            pagination: {

                total: totalPlans,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalPlans / limit,
                    ),

            },

        };

    }


    async getAllByAdmin(
        user: any,
        query: GetMembershipPlansDto,
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

            filter.name = {

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

        const totalPlans =
            await this.membershipPlanModel
                .countDocuments(
                    filter,
                );

        const plans =
            await this.membershipPlanModel
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
                'Membership plans fetched successfully.',

            data: plans,

            pagination: {

                total: totalPlans,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalPlans / limit,
                    ),

            },

        };

    }

    async updateMembershipStatus(
        user: any,
        id: string,
        dto: UpdateMembershipStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const membershipPlan =
            await this.membershipPlanModel.findById(
                id,
            );

        if (!membershipPlan) {

            throw new BadRequestException(
                'Membership plan not found.',
            );

        }

        Object.assign(
            membershipPlan,
            dto,
        );

        await membershipPlan.save();

        return {

            success: true,

            message:
                'Membership status updated successfully.',

            data: membershipPlan,

        };

    }

    async deleteMembershipByAdmin(
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

        const membershipPlan =
            await this.membershipPlanModel.findById(
                id,
            );

        if (!membershipPlan) {

            throw new BadRequestException(
                'Membership plan not found.',
            );

        }

        membershipPlan.isDeleted = true;

        membershipPlan.isActive = false;

        await membershipPlan.save();

        return {

            success: true,

            message:
                'Membership plan deleted successfully.',

        };

    }

}