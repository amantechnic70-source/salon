import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommissionDocument =
    Commission & Document;

@Schema({ timestamps: true })
export class Commission {

    @Prop({
        required: true,
        unique: true,
    })
    commissionId: string;

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
        type: Types.ObjectId,
        ref: 'Appointment',
        required: true,
    })
    appointmentId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Service',
        required: true,
    })
    serviceId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Invoice',
        required: true,
    })
    invoiceId: Types.ObjectId;

    @Prop({
        required: true,
    })
    commissionPercentage: number;

    @Prop({
        required: true,
    })
    serviceAmount: number;

    @Prop({
        required: true,
    })
    commissionAmount: number;

    @Prop({
        default: 'PENDING',
    })
    commissionStatus: string;

    @Prop({
        default: false,
    })
    isPaid: boolean;

    @Prop()
    remarks: string;

    @Prop({
        default: Date.now,
    })
    commissionDate: Date;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const CommissionSchema =
    SchemaFactory.createForClass(
        Commission,
    );


CommissionSchema.index({
    staffId: 1,
});

CommissionSchema.index({
    salonId: 1,
});

CommissionSchema.index({
    appointmentId: 1,
});

CommissionSchema.index({
    commissionStatus: 1,
});