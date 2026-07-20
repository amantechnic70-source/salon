import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    Salon,
    SalonSchema,
} from '../schemas/salon.schema';

import {
    Branch,
    BranchSchema,
} from '../schemas/branch.schema';

import {
    Customer,
    CustomerSchema,
} from '../schemas/customer.schema';

import {
    Staff,
    StaffSchema,
} from '../schemas/staff.schema';

import {
    Service,
    ServiceSchema,
} from '../schemas/service.schema';

import {
    Appointment,
    AppointmentSchema,
} from '../schemas/appointment.schema';

import {
    Attendance,
    AttendanceSchema,
} from '../schemas/attendance.schema';

import {
    Invoice,
    InvoiceSchema,
} from '../schemas/invoice.schema';

import {
    Membership,
    MembershipSchema,
} from '../schemas/membership.schema';

import {
    MembershipPlan,
    MembershipPlanSchema,
} from '../schemas/membership-plan.schema';

import {
    Commission,
    CommissionSchema,
} from '../schemas/commission.schema';

import {
    Coupon,
    CouponSchema,
} from '../schemas/coupon.schema';

import {
    Review,
    ReviewSchema,
} from '../schemas/review.schema';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({

    imports: [

        MongooseModule.forFeature([

            {
                name: Salon.name,
                schema: SalonSchema,
            },

            {
                name: Branch.name,
                schema: BranchSchema,
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
                name: Service.name,
                schema: ServiceSchema,
            },

            {
                name: Appointment.name,
                schema: AppointmentSchema,
            },

            {
                name: Attendance.name,
                schema: AttendanceSchema,
            },

            {
                name: Invoice.name,
                schema: InvoiceSchema,
            },

            {
                name: Membership.name,
                schema: MembershipSchema,
            },

            {
                name: MembershipPlan.name,
                schema: MembershipPlanSchema,
            },

            {
                name: Commission.name,
                schema: CommissionSchema,
            },

            {
                name: Coupon.name,
                schema: CouponSchema,
            },

            {
                name: Review.name,
                schema: ReviewSchema,
            },

        ]),

    ],

    controllers: [
        ReportsController,
    ],

    providers: [
        ReportsService,
    ],

    exports: [
        ReportsService,
    ],

})
export class ReportsModule { }