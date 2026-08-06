import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument =
    Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {

    @Prop({
        type: Types.ObjectId,
        ref: 'Payment',
        default: null,
    })
    paymentId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Transaction',
        default: null,
    })
    transactionId: Types.ObjectId | null;

    @Prop({
        enum: [
            'SALON',
            'CUSTOMER',
        ],
        default: 'CUSTOMER',
    })
    bookingSource: string;

    @Prop({
        enum: [
            'ONLINE',
            'OFFLINE',
        ],
    })
    paymentMethod: string;

    @Prop({
        required: true,
        unique: true,
    })
    appointmentId: string;

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

    @Prop([
        {
            type: Types.ObjectId,
            ref: 'Service',
        },
    ])
    serviceIds: Types.ObjectId[];

    @Prop({
        type: Types.ObjectId,
        ref: 'Membership',
    })
    membershipId: Types.ObjectId | null;

    @Prop({
        type: Types.ObjectId,
        ref: 'Coupon',
    })
    couponId: Types.ObjectId | null;

    @Prop({
        type: String,
        enum: [
            'CUSTOMER',
            'SALON',
            'ADMIN',
        ],
        default: null,
    })
    cancelledBy: string | null;

    @Prop({
        required: true,
    })
    appointmentDate: Date;

    @Prop({
        required: true,
    })
    appointmentTime: string;

    @Prop({
        default: null,
    })
    bookedAt: Date;

    @Prop({
        default: null,
    })
    paidAt: Date;

    @Prop({
        default: 0,
    })
    totalAmount: number;

    @Prop({
        default: 0,
    })
    discountAmount: number;

    @Prop({
        default: 0,
    })
    finalAmount: number;

    @Prop({
        default: 'PENDING',
    })
    paymentStatus: string;

    @Prop({
        default: 'PENDING',
    })
    appointmentStatus: string;

    @Prop()
    notes: string;

    @Prop({
        type: String,
        default: null,
    })
    cancelReason: string | null;
    
    @Prop({
        default: false,
    })
    isCompleted: boolean;

    @Prop({
        default: false,
    })
    isCancelled: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const AppointmentSchema =
    SchemaFactory.createForClass(
        Appointment,
    );