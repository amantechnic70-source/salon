import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { MailQueueService } from './mail-queue.service';

import { MailModule } from '../../mail/mail.module';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail-queue',
    }),

    MailModule,
  ],

  providers: [
    MailQueueService,
    MailProcessor,
  ],

  exports: [MailQueueService],
})
export class MailQueueModule { }