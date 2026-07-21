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

    ]),
  ],

  controllers: [
    PaymentsController,
  ],

  providers: [
    PaymentsService,
    RazorpayService,
  ],

  exports: [
    PaymentsService,
  ],
})
export class PaymentsModule { }