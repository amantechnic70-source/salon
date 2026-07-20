import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument =
    Notification & Document;

@Schema({ timestamps: true })
export class Notification {

    @Prop({
        required: true,
        unique: true,
    })
    notificationId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    userId: Types.ObjectId;

    @Prop({
        required: true,
    })
    title: string;

    @Prop({
        required: true,
    })
    message: string;

    @Prop({
        required: true,
    })
    type: string;

    @Prop()
    referenceId: string;

    @Prop()
    referenceType: string;

    @Prop({
        default: false,
    })
    isRead: boolean;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const NotificationSchema =
    SchemaFactory.createForClass(
        Notification,
    );


NotificationSchema.index({
    userId: 1,
});

NotificationSchema.index({
    type: 1,
});

NotificationSchema.index({
    isRead: 1,
});

NotificationSchema.index({
    isDeleted: 1,
});