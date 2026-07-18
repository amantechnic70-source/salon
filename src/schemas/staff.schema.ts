import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true })
export class Staff {

    @Prop({
        required: true,
        unique: true,
    })
    staffId: string;

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
    email: string;

    @Prop()
    phone: string;

    @Prop()
    profileImage: string;

    @Prop()
    designation: string;

    @Prop()
    salary: number;

    @Prop()
    commissionPercentage: number;

    @Prop()
    experience: number;

    @Prop()
    joiningDate: Date;

    @Prop()
    gender: string;

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

export const StaffSchema =
    SchemaFactory.createForClass(
        Staff,
    );