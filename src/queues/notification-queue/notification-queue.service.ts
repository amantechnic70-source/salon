import { Injectable } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue(
      'notification-queue',
    )
    private readonly queue: Queue,
  ) {}

  async addNotification(
    data: any,
  ) {
    await this.queue.add(
      'notification',
      data,
    );
  }
}