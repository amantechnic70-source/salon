import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SalonDocument = Salon & Document;

@Schema({ timestamps: true })
export class Salon {

    @Prop({ required: true, unique: true })
    salonId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    ownerId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    logo: string;

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
    gstNumber: string;

    @Prop()
    description: string;

    @Prop()
    bannerImage: string;

    @Prop()
    latitude: number;

    @Prop()
    longitude: number;

    @Prop({
        default: false,
    })
    isSubscriptionActive: boolean;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: false })
    isDeleted: boolean;

}

export const SalonSchema = SchemaFactory.createForClass(Salon);

SalonSchema.index({
    salonId: 1,
});

SalonSchema.index({
    city: 1,
});

SalonSchema.index({
    ownerId: 1,
});

SalonSchema.index({
    isVerified: 1,
});

SalonSchema.index({
    isDeleted: 1,
});