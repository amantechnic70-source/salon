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

    ]),

  ],

  controllers: [
    PaymentsController,
  ],

  providers: [
    PaymentsService, RazorpayService
  ],

  exports: [
    PaymentsService,
  ],

})
export class PaymentsModule { }