import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {

    @Prop({ type: Types.ObjectId, ref: 'Appointment' })
    appointmentId: Types.ObjectId;

    @Prop()
    invoiceNumber: string;

    @Prop()
    amount: number;

}

export const InvoiceSchema =
    SchemaFactory.createForClass(Invoice);