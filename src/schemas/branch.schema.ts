import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BranchDocument = Branch & Document;

@Schema({ timestamps: true })
export class Branch {

    @Prop({
        required: true,
        unique: true,
    })
    branchId: string;

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
    address: string;

    @Prop()
    city: string;

    @Prop()
    state: string;

    @Prop()
    country: string;

    @Prop()
    pincode: string;

    @Prop()
    description: string;

    @Prop()
    latitude: number;

    @Prop()
    longitude: number;

    @Prop()
    openingTime: string;

    @Prop()
    closingTime: string;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const BranchSchema =
    SchemaFactory.createForClass(
        Branch,
    );