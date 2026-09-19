import { Module } from '@nestjs/common';
import { MailQueueModule } from './mail-queue/mail-queue.module';
import { NotificationQueueModule } from './notification-queue/notification-queue.module';
import { PaymentQueueModule } from './payment-queue/payment-queue.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [

    ConfigModule,

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: Number(config.get<string>('REDIS_PORT')),
          username: config.get<string>('REDIS_USERNAME'),
          password: config.get<string>('REDIS_PASSWORD'),
          db: Number(config.get<string>('REDIS_DB') || 0),
        },
      }),
    }),

    MailQueueModule,
    NotificationQueueModule,
    PaymentQueueModule
  ]
})
export class QueuesModule { }
