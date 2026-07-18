import { Injectable } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

@Injectable()
export class MailQueueService {
  constructor(
    @InjectQueue('mail-queue')
    private readonly mailQueue: Queue,
  ) { }

  async sendForgotPasswordEmail(
    data: any,
  ) {
    await this.mailQueue.add(
      'forgot-password',

      data,
    );
  }

  async sendWelcomeEmail(
    data: any,
  ) {
    await this.mailQueue.add(
      'welcome-email',

      data,
    );
  }

  async sendPasswordChangedEmail(
    data: any,
  ) {
    await this.mailQueue.add(
      'password-changed',

      data,
    );
  }

  async sendOTPEmail(
    data: any,
  ) {

    await this.mailQueue.add(

      'send-otp',

      data,

    );

  }
}