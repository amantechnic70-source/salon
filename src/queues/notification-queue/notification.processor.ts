import {
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';

import { Job } from 'bullmq';

@Processor(
  'notification-queue',
)
export class NotificationProcessor
  extends WorkerHost
{
  async process(
    job: Job<any>,
  ) {
    console.log(
      'Notification Job : ',
      job.data,
    );
  }
}