import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument =
    Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {

    @Prop({
        required: true,
        unique: true,
    })
    attendanceId: string;

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
        type: Types.ObjectId,
        ref: 'Staff',
        required: true,
    })
    staffId: Types.ObjectId;

    @Prop({
        required: true,
    })
    date: Date;

    @Prop()
    checkInTime: string;

    @Prop()
    checkOutTime: string;

    @Prop({
        default: 0,
    })
    workingHours: number;

    @Prop({
        default: 'PRESENT',
    })
    status: string;

    @Prop({
        default: false,
    })
    isLate: boolean;

    @Prop({
        default: false,
    })
    isHalfDay: boolean;

    @Prop()
    remarks: string;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const AttendanceSchema =
    SchemaFactory.createForClass(
        Attendance,
    );


AttendanceSchema.index({
    staffId: 1,
});

AttendanceSchema.index({
    salonId: 1,
});

AttendanceSchema.index({
    branchId: 1,
});

AttendanceSchema.index({
    date: 1,
});

AttendanceSchema.index({
    status: 1,
});