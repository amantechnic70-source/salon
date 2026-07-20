import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument =
    Review & Document;

@Schema({ timestamps: true })
export class Review {

    @Prop({
        required: true,
        unique: true,
    })
    reviewId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'Customer',
        required: true,
    })
    customerId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Appointment',
        required: true,
    })
    appointmentId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Salon',
        required: true,
    })
    salonId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Staff',
    })
    staffId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Service',
    })
    serviceId: Types.ObjectId;

    @Prop({
        required: true,
        min: 1,
        max: 5,
    })
    rating: number;

    @Prop()
    review: string;

    @Prop({
        default: false,
    })
    isApproved: boolean;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const ReviewSchema =
    SchemaFactory.createForClass(
        Review,
    );


ReviewSchema.index({
    customerId: 1,
});

ReviewSchema.index({
    salonId: 1,
});

ReviewSchema.index({
    staffId: 1,
});

ReviewSchema.index({
    serviceId: 1,
});

ReviewSchema.index({
    rating: 1,
});