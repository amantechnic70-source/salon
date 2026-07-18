import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument =
    Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {

    @Prop({
        required: true,
        unique: true,
    })
    subscriptionId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'Salon',
        required: true,
    })
    salonId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true,
    })
    planId: Types.ObjectId;

    @Prop({
        required: true,
    })
    startDate: Date;

    @Prop({
        required: true,
    })
    expiryDate: Date;

    @Prop({
        required: true,
    })
    amount: number;

    @Prop({
        required: true,
    })
    status: string;

    @Prop({
        default: true,
    })
    autoRenew: boolean;

    @Prop({
        default: false,
    })
    isAutoRenew: boolean;

    @Prop({
        default: false,
    })
    isActive: boolean;

}

export const SubscriptionSchema =
    SchemaFactory.createForClass(
        Subscription,
    );