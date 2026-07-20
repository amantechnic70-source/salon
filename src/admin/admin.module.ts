import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    User,
    UserSchema,
} from '../schemas/user.schema';

import {
    Salon,
    SalonSchema,
} from '../schemas/salon.schema';

import {
    Customer,
    CustomerSchema,
} from '../schemas/customer.schema';

import {
    Staff,
    StaffSchema,
} from '../schemas/staff.schema';

import {
    Appointment,
    AppointmentSchema,
} from '../schemas/appointment.schema';

import {
    Invoice,
    InvoiceSchema,
} from '../schemas/invoice.schema';

import {
    Subscription,
    SubscriptionSchema,
} from '../schemas/subscription.schema';

import {
    Payment,
    PaymentSchema,
} from '../schemas/payment.schema';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PlatformSetting, PlatformSettingSchema } from 'src/schemas/platform-setting.schema';

@Module({

    imports: [

        MongooseModule.forFeature([

            {
                name: User.name,
                schema: UserSchema,
            },

            {
                name: Salon.name,
                schema: SalonSchema,
            },

            {
                name: Customer.name,
                schema: CustomerSchema,
            },

            {
                name: Staff.name,
                schema: StaffSchema,
            },

            {
                name: Appointment.name,
                schema: AppointmentSchema,
            },

            {
                name: Invoice.name,
                schema: InvoiceSchema,
            },

            {
                name: Subscription.name,
                schema: SubscriptionSchema,
            },

            {
                name: Payment.name,
                schema: PaymentSchema,
            },

            {
                name: PlatformSetting.name,
                schema: PlatformSettingSchema,
            },

        ]),

    ],

    controllers: [
        AdminController,
    ],

    providers: [
        AdminService,
    ],

    exports: [
        AdminService,
    ],

})
export class AdminModule { }