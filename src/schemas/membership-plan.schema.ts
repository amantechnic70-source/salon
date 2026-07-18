import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MembershipPlanDocument =
    MembershipPlan & Document;

@Schema({ timestamps: true })
export class MembershipPlan {

    @Prop({
        required: true,
        unique: true,
    })
    membershipPlanId: string;

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
    amount: number;

    @Prop()
    durationInDays: number;

    @Prop()
    discountPercentage: number;

    @Prop()
    loyaltyPoints: number;

    @Prop()
    description: string;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const MembershipPlanSchema =
    SchemaFactory.createForClass(
        MembershipPlan,
    );