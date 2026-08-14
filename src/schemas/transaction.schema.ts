import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument =
    Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {

    @Prop({
        type: Types.ObjectId,
        ref: 'Payment',
        required: true,
        index: true,
    })
    paymentId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Appointment',
        default: null,
        index: true,
    })
    appointmentId: Types.ObjectId | null;

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
        type: String,
        required: true,
        unique: true,
        index: true,
    })
    transactionId: string;

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
        default: null,
        index: true,
    })
    providerTransactionId: string | null;

    @Prop({
        type: String,
        enum: [
            'SUBSCRIPTION',
            'APPOINTMENT',
        ],
        required: true,
        index: true,
    })
    transactionType: string;

    @Prop({
        type: String,
        enum: [
            'ONLINE',
            'OFFLINE',
        ],
        default: null,
    })
    paymentMethod: string | null;

    @Prop({
        type: String,
        enum: [
            'PENDING',
            'SUCCESS',
            'FAILED',
            'REFUNDED',
        ],
        required: true,
        default: 'PENDING',
        index: true,
    })
    status: string;
}

export const TransactionSchema =
    SchemaFactory.createForClass(
        Transaction,
    );