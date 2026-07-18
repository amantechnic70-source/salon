import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MembershipDocument =
    Membership & Document;

@Schema({ timestamps: true })
export class Membership {

    @Prop({
        required: true,
        unique: true,
    })
    membershipId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'Customer',
        required: true,
    })
    customerId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'MembershipPlan',
        required: true,
    })
    membershipPlanId: Types.ObjectId;

    @Prop()
    startDate: Date;

    @Prop()
    expiryDate: Date;

    @Prop()
    amount: number;

    @Prop()
    status: string;

    @Prop({
        default: true,
    })
    isActive: boolean;

}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
