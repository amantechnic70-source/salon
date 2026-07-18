import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PaymentQueueService } from './payment-queue.service';
import { PaymentProcessor } from './payment.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'payment-queue',
    }),
  ],

  providers: [
    PaymentQueueService,
    PaymentProcessor,
  ],

  exports: [PaymentQueueService],
})
export class PaymentQueueModule {}