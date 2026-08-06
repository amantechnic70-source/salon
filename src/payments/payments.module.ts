import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PaymentsController } from './payments.controller';

import {
  Payment,
  PaymentSchema,
} from '../schemas/payment.schema';

import {
  Transaction,
  TransactionSchema,
} from '../schemas/transaction.schema';
import { PaymentsService } from './payments.service';
import { RazorpayService } from './providers/razorpay/razorpay.service';

import {
  Subscription,
  SubscriptionSchema,
} from '../schemas/subscription.schema';

import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from '../schemas/subscription-plan.schema';

import {
  Salon,
  SalonSchema,
} from '../schemas/salon.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { AppointmentPaymentService } from './appointment-payment.service';
import { AppointmentPaymentController } from './appointment-payment.controller';
import { Appointment, AppointmentSchema } from 'src/schemas/appointment.schema';
import { Customer, CustomerSchema } from 'src/schemas/customer.schema';
import { Branch, BranchSchema } from 'src/schemas/branch.schema';
import { Staff, StaffSchema } from 'src/schemas/staff.schema';
import { Service, ServiceSchema } from 'src/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([

      {
        name: Payment.name,
        schema: PaymentSchema,
      },

      {
        name: Transaction.name,
        schema: TransactionSchema,
      },

      {
        name: Subscription.name,
        schema: SubscriptionSchema,
      },

      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlanSchema,
      },

      {
        name: Salon.name,
        schema: SalonSchema,
      },

      {
        name: User.name,
        schema: UserSchema,
      },

      {
        name: Appointment.name,
        schema: AppointmentSchema,
      },

      {
        name: Customer.name,
        schema: CustomerSchema,
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
        name: Service.name,
        schema: ServiceSchema,
      },



    ]),
  ],

  controllers: [
    PaymentsController,
    AppointmentPaymentController,
  ],

  providers: [
    PaymentsService,
    RazorpayService,
    AppointmentPaymentService,
  ],

  exports: [
    PaymentsService,
  ],
})
export class PaymentsModule { }