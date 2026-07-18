import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { NotificationQueueService } from './notification-queue.service';
import { NotificationProcessor } from './notification.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
  ],

  providers: [
    NotificationQueueService,
    NotificationProcessor,
  ],

  exports: [NotificationQueueService],
})
export class NotificationQueueModule {}