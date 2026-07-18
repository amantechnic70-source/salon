import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {

    @Prop({
        required: true,
        unique: true,
    })
    paymentId: string;

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
    amount: number;

    @Prop({
        default: 'RAZORPAY',
    })
    provider: string;

    @Prop()
    orderId: string;

    @Prop()
    paymentStatus: string;

    @Prop()
    paymentMethod: string;

    @Prop()
    razorpayPaymentId: string;

    @Prop()
    razorpaySignature: string;

    @Prop()
    currency: string;

    @Prop()
    failureReason: string;

    @Prop({
        default: false,
    })
    isRefunded: boolean;

}

export const PaymentSchema =
    SchemaFactory.createForClass(
        Payment,
    );