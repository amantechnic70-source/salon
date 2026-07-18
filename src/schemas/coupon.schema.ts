import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument =
    Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {

    @Prop({
        required: true,
        unique: true,
    })
    couponId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'Salon',
        required: true,
    })
    salonId: Types.ObjectId;

    @Prop({
        required: true,
    })
    code: string;

    @Prop()
    description: string;

    @Prop()
    discountType: string;

    @Prop()
    discountValue: number;

    @Prop()
    minimumAmount: number;

    @Prop()
    maximumDiscount: number;

    @Prop()
    usageLimit: number;

    @Prop({
        default: 0,
    })
    usedCount: number;

    @Prop()
    expiryDate: Date;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const CouponSchema =
    SchemaFactory.createForClass(
        Coupon,
    );