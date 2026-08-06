import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    Appointment,
    AppointmentSchema,
} from '../schemas/appointment.schema';

import {
    Salon,
    SalonSchema,
} from '../schemas/salon.schema';

import {
    Branch,
    BranchSchema,
} from '../schemas/branch.schema';

import {
    Staff,
    StaffSchema,
} from '../schemas/staff.schema';

import {
    Customer,
    CustomerSchema,
} from '../schemas/customer.schema';

import {
    Service,
    ServiceSchema,
} from '../schemas/service.schema';

import {
    Membership,
    MembershipSchema,
} from '../schemas/membership.schema';

import {
    Coupon,
    CouponSchema,
} from '../schemas/coupon.schema';

import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CustomerBookingService } from './customer-booking.service';
import { CustomerBookingController } from './customer-booking.controller';

@Module({

    imports: [

        MongooseModule.forFeature([

            {
                name: Appointment.name,
                schema: AppointmentSchema,
            },

            {
                name: Salon.name,
                schema: SalonSchema,
            },

            {
                name: Branch.name,
                schema: BranchSchema,
            },

            {
                name: Staff.name,
                schema: StaffSchema,
            },

            {
                name: Customer.name,
                schema: CustomerSchema,
            },

            {
                name: Service.name,
                schema: ServiceSchema,
            },

            {
                name: Membership.name,
                schema: MembershipSchema,
            },

            {
                name: Coupon.name,
                schema: CouponSchema,
            },

            {
                name: User.name,
                schema: UserSchema,
            },

        ]),

    ],

    controllers: [
        AppointmentsController,
        CustomerBookingController,
    ],

    providers: [
        AppointmentsService,
        CustomerBookingService,
    ],

    exports: [
        AppointmentsService,
    ],

})
export class AppointmentsModule { }