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
    _id: false,
})
export class BookingData {

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        default: null,
    })
    userId: Types.ObjectId | null;

    @Prop({
        type: Types.ObjectId,
        ref: 'Salon',
        required: true,
    })
    salonId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Branch',
        required: true,
    })
    branchId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Customer',
        required: true,
    })
    customerId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Staff',
        required: true,
    })
    staffId: Types.ObjectId;

    @Prop({
        type: [
            {
                type: Types.ObjectId,
                ref: 'Service',
            },
        ],
        required: true,
    })
    serviceIds: Types.ObjectId[];

    @Prop({
        type: Types.ObjectId,
        ref: 'Membership',
        default: null,
    })
    membershipId: Types.ObjectId | null;

    @Prop({
        type: Types.ObjectId,
        ref: 'Coupon',
        default: null,
    })
    couponId: Types.ObjectId | null;

    @Prop({
        type: Date,
        required: true,
    })
    appointmentDate: Date;

    @Prop({
        type: String,
        required: true,
    })
    appointmentTime: string;

    @Prop({
        type: String,
        default: null,
    })
    customerName: string | null;

    @Prop({
        type: String,
        default: null,
    })
    customerEmail: string | null;

    @Prop({
        type: String,
        default: null,
    })
    customerPhone: string | null;

    @Prop({
        type: String,
        default: null,
    })
    customerGender: string | null;

    @Prop({
        type: Date,
        default: null,
    })
    customerDateOfBirth: Date | null;

    @Prop({
        type: String,
        default: null,
    })
    customerAddress: string | null;

    @Prop({
        type: String,
        default: null,
    })
    notes: string | null;

    @Prop({
        type: Number,
        required: true,
        min: 0,
    })
    totalAmount: number;

    @Prop({
        type: Number,
        default: 0,
        min: 0,
    })
    discountAmount: number;

    @Prop({
        type: Number,
        required: true,
        min: 0,
    })
    finalAmount: number;
}

export const BookingDataSchema =
    SchemaFactory.createForClass(
        BookingData,
    );

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

    @Prop({
        type: String,
        enum: [
            'SUBSCRIPTION',
            'APPOINTMENT',
        ],
        required: true,
    })
    paymentType: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'Appointment',
        default: null,
    })
    appointmentId: Types.ObjectId | null;

    @Prop({
        type: BookingDataSchema,
        default: null,
    })
    bookingData: BookingData | null;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    })
    userId: Types.ObjectId;

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
        default: null,
        index: true,
    })
    planId: Types.ObjectId | null;

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