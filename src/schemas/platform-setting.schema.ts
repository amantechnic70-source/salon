import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import {
    Document,
} from 'mongoose';

export type PlatformSettingDocument =
    PlatformSetting &
    Document;

@Schema({
    timestamps: true,
})
export class PlatformSetting {

    @Prop({
        required: true,
        unique: true,
        default: 'PLATFORM_SETTINGS',
    })
    settingId: string;

    @Prop({
        default: 'Salon Marketplace',
    })
    companyName: string;

    @Prop({
        required: true,
    })
    supportEmail: string;

    @Prop()
    supportPhone: string;

    @Prop({
        default: 'INR',
    })
    currency: string;

    @Prop({
        default: 18,
    })
    taxPercentage: number;

    @Prop({
        default: 0,
    })
    platformCommission: number;

    @Prop({
        default: false,
    })
    maintenanceMode: boolean;

    @Prop({
        default: true,
    })
    subscriptionEnabled: boolean;

    @Prop({
        default: true,
    })
    couponEnabled: boolean;

    @Prop({
        default: true,
    })
    membershipEnabled: boolean;

    @Prop({
        default: true,
    })
    notificationEnabled: boolean;

    @Prop({
        default: true,
    })
    emailNotificationEnabled: boolean;

    @Prop({
        default: false,
    })
    smsNotificationEnabled: boolean;

    @Prop({
        default: true,
    })
    isSalonApprovalRequired: boolean;

    @Prop({
        default: true,
    })
    isBranchEnabled: boolean;

    @Prop({
        default: true,
    })
    isReviewEnabled: boolean;

    @Prop({
        default: true,
    })
    isReferralEnabled: boolean;

    @Prop({
        default: true,
    })
    isActive: boolean;

}

export const PlatformSettingSchema =
    SchemaFactory.createForClass(
        PlatformSetting,
    );