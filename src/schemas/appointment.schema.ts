import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import {
    Document,
    Types,
} from 'mongoose';

export type AppointmentDocument =
    Appointment & Document;

@Schema({
    timestamps: true,
})
export class Appointment {

    @Prop({
        type: Types.ObjectId,
        ref: 'Payment',
        default: null,
        index: true,
    })
    paymentId: Types.ObjectId | null;

    @Prop({
        type: Types.ObjectId,
        ref: 'Transaction',
        default: null,
        index: true,
    })
    transactionId: Types.ObjectId | null;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    })
    userId: Types.ObjectId | null;

    @Prop({
        type: Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true,
    })
    customerId: Types.ObjectId;

    @Prop({
        type: String,
        enum: [
            'SALON',
            'CUSTOMER',
            'ADMIN',
        ],
        default: 'CUSTOMER',
        index: true,
    })
    bookingSource: string;

    @Prop({
        type: String,
        enum: [
            'ONLINE',
            'OFFLINE',
        ],
        default: 'OFFLINE',
        index: true,
    })
    paymentMethod: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        index: true,
    })
    appointmentId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'Salon',
        required: true,
        index: true,
    })
    salonId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Branch',
        required: true,
        index: true,
    })
    branchId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Staff',
        required: true,
        index: true,
    })
    staffId: Types.ObjectId;

    @Prop([
        {
            type: Types.ObjectId,
            ref: 'Service',
        },
    ])
    serviceIds: Types.ObjectId[];

    @Prop({
        type: Types.ObjectId,
        ref: 'Membership',
        default: null,
    })
    membershipId: Types.ObjectId | null;

    @Prop({
        type: Types.ObjectId,
        ref: 'Coupon',
        default: null,
    })
    couponId: Types.ObjectId | null;

    // ==========================================
    // CUSTOMER SNAPSHOT
    // ==========================================
    @Prop({
        type: String,
        default: null,
    })
    customerName: string | null;

    @Prop({
        type: String,
        default: null,
    })
    customerEmail: string | null;

    @Prop({
        type: String,
        default: null,
    })
    customerPhone: string | null;

    @Prop({
        type: String,
        default: null,
    })
    customerGender: string | null;

    @Prop({
        type: Date,
        default: null,
    })
    customerDateOfBirth: Date | null;

    @Prop({
        type: String,
        default: null,
    })
    customerAddress: string | null;

    // ==========================================
    // APPOINTMENT DATE / TIME
    // ==========================================

    @Prop({
        type: Date,
        required: true,
        index: true,
    })
    appointmentDate: Date;

    @Prop({
        type: String,
        required: true,
    })
    appointmentTime: string;

    // ==========================================
    // PAYMENT / BOOKING DATES
    // ==========================================

    @Prop({
        type: Date,
        default: null,
    })
    bookedAt: Date | null;

    @Prop({
        type: Date,
        default: null,
    })
    paidAt: Date | null;

    // ==========================================
    // AMOUNT
    // ==========================================

    @Prop({
        type: Number,
        default: 0,
        min: 0,
    })
    totalAmount: number;

    @Prop({
        type: Number,
        default: 0,
        min: 0,
    })
    discountAmount: number;

    @Prop({
        type: Number,
        default: 0,
        min: 0,
    })
    finalAmount: number;

    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    @Prop({
        type: String,
        enum: [
            'PENDING',
            'SUCCESS',
            'FAILED',
            'REFUNDED',
        ],
        default: 'PENDING',
        index: true,
    })
    paymentStatus: string;

    // ==========================================
    // APPOINTMENT STATUS
    // ==========================================

    @Prop({
        type: String,
        enum: [
            'PENDING',
            'CONFIRMED',
            'COMPLETED',
            'CANCELLED',
        ],
        default: 'PENDING',
        index: true,
    })
    appointmentStatus: string;

    // ==========================================
    // NOTES
    // ==========================================

    @Prop({
        type: String,
        default: null,
    })
    notes: string | null;

    // ==========================================
    // CANCELLATION
    // ==========================================

    @Prop({
        type: String,
        default: null,
        enum: [
            'CUSTOMER',
            'SALON',
            'ADMIN',
        ],
    })
    cancelledBy: string | null;

    @Prop({
        type: String,
        default: null,
    })
    cancelReason: string | null;

    // ==========================================
    // FLAGS
    // ==========================================

    @Prop({
        type: Boolean,
        default: false,
    })
    isCompleted: boolean;

    @Prop({
        type: Boolean,
        default: false,
    })
    isCancelled: boolean;

    @Prop({
        type: Boolean,
        default: false,
    })
    isDeleted: boolean;
}

export const AppointmentSchema =
    SchemaFactory.createForClass(
        Appointment,
    );

// ==========================================
// INDEXES
// ==========================================

AppointmentSchema.index({
    salonId: 1,
    appointmentDate: 1,
});

AppointmentSchema.index({
    salonId: 1,
    branchId: 1,
    appointmentDate: 1,
});

AppointmentSchema.index({
    customerId: 1,
});

AppointmentSchema.index({
    userId: 1,
});

AppointmentSchema.index({
    staffId: 1,
    appointmentDate: 1,
});

AppointmentSchema.index({
    appointmentStatus: 1,
});

AppointmentSchema.index({
    paymentStatus: 1,
});

AppointmentSchema.index({
    bookingSource: 1,
});

AppointmentSchema.index({
    paymentMethod: 1,
});