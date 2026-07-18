import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument =
    Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {

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
    membershipId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Coupon',
    })
    couponId: Types.ObjectId;

    @Prop({
        required: true,
    })
    appointmentDate: Date;

    @Prop({
        required: true,
    })
    appointmentTime: string;

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