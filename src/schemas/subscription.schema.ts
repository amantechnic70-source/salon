import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import {
    HydratedDocument,
    Types,
} from 'mongoose';

export type SubscriptionDocument =
    HydratedDocument<Subscription>;

@Schema({
    timestamps: true,
})
export class Subscription {

    @Prop({
        type: String,
        required: true,
        unique: true,
        index: true,
    })
    subscriptionId: string;


    // Owner who purchased subscription

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    })
    userId: Types.ObjectId;


    // Null until salon onboarding is completed

    @Prop({
        type: Types.ObjectId,
        ref: 'Salon',
        default: null,
        index: true,
    })
    salonId: Types.ObjectId | null;


    // Payment used to purchase this subscription

    @Prop({
        type: Types.ObjectId,
        ref: 'Payment',
        required: true,
        unique: true,
        index: true,
    })
    paymentId: Types.ObjectId;


    @Prop({
        type: Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true,
        index: true,
    })
    planId: Types.ObjectId;


    @Prop({
        type: Date,
        required: true,
    })
    startDate: Date;


    @Prop({
        type: Date,
        required: true,
        index: true,
    })
    expiryDate: Date;


    @Prop({
        type: Number,
        required: true,
        min: 0,
    })
    amount: number;


    @Prop({
        type: String,
        required: true,
        enum: [
            'ACTIVE',
            'EXPIRED',
            'CANCELLED',
            'UPGRADED',
        ],
        index: true,
    })
    status: string;


    @Prop({
        type: Boolean,
        default: true,
    })
    autoRenew: boolean;


    @Prop({
        type: Boolean,
        default: false,
    })
    isAutoRenew: boolean;


    @Prop({
        type: Boolean,
        default: false,
        index: true,
    })
    isActive: boolean;

}

export const SubscriptionSchema =
    SchemaFactory.createForClass(
        Subscription,
    );