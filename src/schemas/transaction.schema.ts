import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument =
    Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {

    @Prop({
        type: Types.ObjectId,
        ref: 'Payment',
    })
    paymentId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Appointment',
        default: null,
    })
    appointmentId: Types.ObjectId | null;

    @Prop({
        type: Types.ObjectId,
        ref: 'User'
    })
    userId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Salon'
    })
    salonId: Types.ObjectId;

    @Prop()
    transactionId: string;

    @Prop()
    amount: number;

    @Prop()
    provider: string;

    @Prop()
    providerTransactionId: string;

    @Prop()
    status: string;

}

export const TransactionSchema =
    SchemaFactory.createForClass(
        Transaction,
    );