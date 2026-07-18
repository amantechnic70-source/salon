import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {

    @Prop({
        required: true,
        unique: true,
    })
    serviceId: string;

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
        required: true,
    })
    name: string;

    @Prop()
    category: string;

    @Prop()
    description: string;

    @Prop()
    serviceImage: string;

    @Prop()
    genderType: string;

    @Prop({
        required: true,
    })
    price: number;

    @Prop({
        default: 0,
    })
    discount: number;

    @Prop()
    discountPrice: number;

    @Prop({
        required: true,
    })
    duration: number;

    @Prop({
        default: false,
    })
    isPopular: boolean;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const ServiceSchema =
    SchemaFactory.createForClass(
        Service,
    );