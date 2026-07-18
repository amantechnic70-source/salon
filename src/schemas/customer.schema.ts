import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {

    @Prop({
        required: true,
        unique: true,
    })
    customerId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'Salon',
        required: true,
    })
    salonId: Types.ObjectId;

    @Prop({
        required: true,
    })
    name: string;

    @Prop()
    email: string;

    @Prop()
    phone: string;

    @Prop()
    gender: string;

    @Prop()
    dateOfBirth: Date;

    @Prop()
    address: string;

    @Prop()
    profileImage: string;

    @Prop({
        default: 0,
    })
    loyaltyPoints: number;

    @Prop({
        default: 0,
    })
    totalVisits: number;

    @Prop({
        default: 0,
    })
    totalSpent: number;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const CustomerSchema =
    SchemaFactory.createForClass(
        Customer,
    );