import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {

    @Prop({ type: Types.ObjectId, ref: 'Salon' })
    salonId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Customer' })
    customerId: Types.ObjectId;

    @Prop()
    rating: number;

    @Prop()
    comment: string;

}

export const ReviewSchema =
    SchemaFactory.createForClass(Review);