import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument =
    Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {

    @Prop({
        required: true,
        unique: true,
    })
    invoiceId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'Appointment',
        required: true,
    })
    appointmentId: Types.ObjectId;

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
        required: true,
        unique: true,
    })
    invoiceNumber: string;

    @Prop({
        default: 0,
    })
    subtotal: number;

    @Prop({
        default: 0,
    })
    discountAmount: number;

    @Prop({
        default: 0,
    })
    taxAmount: number;

    @Prop({
        default: 0,
    })
    finalAmount: number;

    @Prop()
    remarks: string;

    @Prop({
        default: 'PAID',
    })
    paymentStatus: string;

    @Prop({
        default: 'GENERATED',
    })
    invoiceStatus: string;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const InvoiceSchema =
    SchemaFactory.createForClass(
        Invoice,
    );