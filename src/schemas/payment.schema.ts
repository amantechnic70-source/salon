import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import {
    HydratedDocument,
    Types,
} from 'mongoose';

export type PaymentDocument =
    HydratedDocument<Payment>;

@Schema({
    timestamps: true,
})
export class Payment {

    @Prop({
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    })
    paymentId: string;


    // Payment belongs to user initially,
    // because salon doesn't exist yet.

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    })
    userId: Types.ObjectId;


    // Salon will be null until onboarding completes.

    @Prop({
        type: Types.ObjectId,
        ref: 'Salon',
        default: null,
        index: true,
    })
    salonId: Types.ObjectId | null;


    @Prop({
        type: Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true,
        index: true,
    })
    planId: Types.ObjectId;


    @Prop({
        type: Number,
        required: true,
        min: 0,
    })
    amount: number;


    @Prop({
        type: String,
        required: true,
        default: 'INR',
        uppercase: true,
        trim: true,
    })
    currency: string;


    @Prop({
        type: String,
        required: true,
        default: 'RAZORPAY',
        uppercase: true,
        trim: true,
    })
    provider: string;


    @Prop({
        type: String,
        required: true,
        unique: true,
        index: true,
    })
    orderId: string;


    @Prop({
        type: String,
        required: true,
        enum: [
            'PENDING',
            'SUCCESS',
            'FAILED',
            'REFUNDED',
        ],
        default: 'PENDING',
        index: true,
    })
    paymentStatus: string;


    @Prop({
        type: String,
        default: null,
    })
    paymentMethod: string | null;


    @Prop({
        type: String,
        default: null,
        index: true,
    })
    razorpayPaymentId: string | null;


    @Prop({
        type: String,
        default: null,
    })
    razorpaySignature: string | null;


    @Prop({
        type: String,
        default: null,
    })
    failureReason: string | null;


    @Prop({
        type: Boolean,
        default: false,
    })
    isRefunded: boolean;


    @Prop({
        type: Date,
        default: null,
    })
    refundedAt: Date | null;

}

export const PaymentSchema =
    SchemaFactory.createForClass(
        Payment,
    );