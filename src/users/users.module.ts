import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import {
  User,
  UserSchema,
} from '../schemas/user.schema';
import { MailModule } from 'src/mail/mail.module';
import { MailQueueModule } from 'src/queues/mail-queue/mail-queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    MailModule,
    MailQueueModule
  ],

  controllers: [UsersController],

  providers: [UsersService],

  exports: [UsersService, MongooseModule],
})
export class UsersModule { }