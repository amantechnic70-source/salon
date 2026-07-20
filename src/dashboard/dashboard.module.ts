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
  Invoice,
  InvoiceSchema,
} from '../schemas/invoice.schema';

import {
  Commission,
  CommissionSchema,
} from '../schemas/commission.schema';

import {
  Review,
  ReviewSchema,
} from '../schemas/review.schema';

import {
  Membership,
  MembershipSchema,
} from '../schemas/membership.schema';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

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
        name: Invoice.name,
        schema: InvoiceSchema,
      },

      {
        name: Commission.name,
        schema: CommissionSchema,
      },

      {
        name: Review.name,
        schema: ReviewSchema,
      },

      {
        name: Membership.name,
        schema: MembershipSchema,
      },

    ]),

  ],

  controllers: [
    DashboardController,
  ],

  providers: [
    DashboardService,
  ],

  exports: [
    DashboardService,
  ],

})
export class DashboardModule { }