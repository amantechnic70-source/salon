import { Injectable } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

@Injectable()
export class PaymentQueueService {
  constructor(
    @InjectQueue('payment-queue')
    private readonly queue: Queue,
  ) {}

  async processPayment(
    data: any,
  ) {
    await this.queue.add(
      'payment',
      data,
    );
  }
}