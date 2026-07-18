import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

    @Prop({
        required: true,
        unique: true,
    })
    userId: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    phone: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    role: string;

    @Prop({ type: Types.ObjectId, ref: 'Salon' })
    salonId: Types.ObjectId;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);