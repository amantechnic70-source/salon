import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import {
    Subscription,
    SubscriptionDocument,
} from 'src/schemas/subscription.schema';

import {
    SubscriptionPlan,
    SubscriptionPlanDocument,
} from 'src/schemas/subscription-plan.schema';

import {
    Salon,
    SalonDocument,
} from 'src/schemas/salon.schema';

import {
    User,
    UserDocument,
} from 'src/schemas/user.schema';

import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SelectPlanDto } from './dto/select-plan.dto';
import { UpgradePlanDto } from './dto/upgrade-plan.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class SubscriptionService {

    constructor(

        @InjectModel(Subscription.name)
        private readonly subscriptionModel:
            Model<SubscriptionDocument>,

        @InjectModel(SubscriptionPlan.name)
        private readonly planModel:
            Model<SubscriptionPlanDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,

    ) { }

    async getPlans() {

        const plans =
            await this.planModel.find({
                isActive: true,
            });

        return {

            success: true,

            data: plans,

        };

    }

    async createPlan(
        user: any,
        dto: CreatePlanDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }


        const totalPlans =
            await this.planModel.countDocuments();


        const planId =
            `PLAN${String(
                totalPlans + 1,
            ).padStart(6, '0')}`;


        const plan =
            await this.planModel.create({

                planId,

                ...dto,

                isActive: true,

            });


        return {

            success: true,

            message:
                'Plan created successfully.',

            data: plan,

        };

    }

    async updatePlan(
        user: any,
        id: string,
        dto: UpdatePlanDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }


        const plan =
            await this.planModel.findById(
                id,
            );


        if (!plan) {

            throw new BadRequestException(
                'Plan not found.',
            );

        }


        Object.assign(
            plan,
            dto,
        );


        await plan.save();


        return {

            success: true,

            message:
                'Plan updated successfully.',

            data: plan,

        };

    }

    async deletePlan(
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


        const plan =
            await this.planModel.findById(
                id,
            );


        if (!plan) {

            throw new BadRequestException(
                'Plan not found.',
            );

        }


        plan.isActive = false;

        await plan.save();


        return {

            success: true,

            message:
                'Plan deleted successfully.',

        };

    }

    async selectPlan(
        userId: string,
        dto: SelectPlanDto,
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


        const plan =
            await this.planModel.findById(
                dto.planId,
            );


        if (!plan) {

            throw new BadRequestException(
                'Plan not found.',
            );

        }


        // PAYMENT MODULE WILL COME HERE

        const startDate =
            new Date();


        const expiryDate =
            new Date();


        expiryDate.setDate(
            expiryDate.getDate()
            + plan.durationInDays,
        );


        const totalSubscription =
            await this.subscriptionModel
                .countDocuments();


        const subscriptionId =
            `SUB${String(
                totalSubscription + 1,
            ).padStart(6, '0')}`;


        const subscription =
            await this.subscriptionModel
                .create({

                    subscriptionId,

                    salonId:
                        salon._id,

                    planId:
                        plan._id,

                    amount:
                        plan.amount,

                    startDate,

                    expiryDate,

                    status:
                        'ACTIVE',

                    isActive:
                        true,

                });


        salon.isSubscriptionActive =
            true;


        await salon.save();


        return {

            success: true,

            message:
                'Subscription activated successfully.',

            data:
                subscription,

        };

    }

    async currentPlan(
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


        const subscription =
            await this.subscriptionModel
                .findOne({

                    salonId:
                        salon._id,

                    status:
                        'ACTIVE',

                })

                .populate(
                    'planId',
                );


        return {

            success: true,

            data:
                subscription,

        };

    }

    async upgradePlan(
        userId: string,
        dto: UpgradePlanDto,
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


        // Current Subscription

        const currentSubscription =
            await this.subscriptionModel.findOne({

                salonId: salon._id,

                status: 'ACTIVE',

            });


        if (!currentSubscription) {

            throw new BadRequestException(
                'No active subscription found.',
            );

        }


        // New Plan

        const newPlan =
            await this.planModel.findById(
                dto.planId,
            );

        if (!newPlan) {

            throw new BadRequestException(
                'Subscription plan not found.',
            );

        }


        // Prevent selecting same plan

        if (
            currentSubscription.planId.toString()
            === dto.planId
        ) {

            throw new BadRequestException(
                'You are already using this plan.',
            );

        }


        // Mark previous subscription as upgraded

        currentSubscription.status =
            'UPGRADED';

        currentSubscription.isActive =
            false;

        await currentSubscription.save();


        // Create new subscription

        const totalSubscription =
            await this.subscriptionModel
                .countDocuments();


        const subscriptionId =
            `SUB${String(
                totalSubscription + 1,
            ).padStart(6, '0')}`;


        const startDate =
            new Date();


        const expiryDate =
            new Date();


        expiryDate.setDate(
            expiryDate.getDate()
            + newPlan.durationInDays,
        );


        const subscription =
            await this.subscriptionModel.create({

                subscriptionId,

                salonId:
                    salon._id,

                planId:
                    newPlan._id,

                amount:
                    newPlan.amount,

                startDate,

                expiryDate,

                status:
                    'ACTIVE',

                isActive:
                    true,

            });


        salon.isSubscriptionActive =
            true;

        await salon.save();


        return {

            success: true,

            message:
                'Subscription upgraded successfully.',

            data:
                subscription,

        };

    }

}