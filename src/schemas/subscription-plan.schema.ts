import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPlanDocument =
    SubscriptionPlan & Document;

@Schema({ timestamps: true })
export class SubscriptionPlan {

    @Prop({
        required: true,
        unique: true,
    })
    planId: string;

    @Prop({
        required: true,
    })
    name: string;

    @Prop({
        required: true,
    })
    amount: number;

    @Prop({
        required: true,
    })
    durationInDays: number;

    @Prop({
        required: true,
    })
    maxStaff: number;

    @Prop({
        required: true,
    })
    maxBranches: number;

    @Prop({
        required: true,
    })
    maxBookings: number;

    @Prop()
    description: string;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isPopular: boolean;

}

export const SubscriptionPlanSchema =
    SchemaFactory.createForClass(
        SubscriptionPlan,
    );