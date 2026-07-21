

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailQueueService } from 'src/queues/mail-queue/mail-queue.service';
import { MailProcessor } from 'src/queues/mail-queue/mail.processor';

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
  ],
  exports: [MailService], // 👈 usable everywhere
})
export class MailModule { }

