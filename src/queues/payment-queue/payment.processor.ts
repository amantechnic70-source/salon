import {
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';

import { Job } from 'bullmq';

@Processor('payment-queue')
export class PaymentProcessor
  extends WorkerHost
{
  async process(
    job: Job<any>,
  ) {
    console.log(
      'Payment Job : ',
      job.data,
    );
  }
}