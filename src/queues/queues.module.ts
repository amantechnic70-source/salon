import { Module } from '@nestjs/common';
import { MailQueueModule } from './mail-queue/mail-queue.module';
import { NotificationQueueModule } from './notification-queue/notification-queue.module';
import { PaymentQueueModule } from './payment-queue/payment-queue.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [

    ConfigModule,

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),

    MailQueueModule,
    NotificationQueueModule,
    PaymentQueueModule
  ]
})
export class QueuesModule { }
