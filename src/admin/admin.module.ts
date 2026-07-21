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
import { RedisService } from 'src/redis/redis.service';
import { MailQueueService } from 'src/queues/mail-queue/mail-queue.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailQueueModule } from 'src/queues/mail-queue/mail-queue.module';
import { RedisModule } from 'src/redis/redis.module';

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

        MailQueueModule,
        RedisModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '1d',
            },
        }),

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