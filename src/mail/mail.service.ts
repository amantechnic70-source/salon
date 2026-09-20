import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {

    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number(
      this.configService.get<string>('MAIL_PORT') || 587,
    );

    const secure =
      this.configService.get<string>('MAIL_SECURE') === 'true';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,

      // Force IPv4
      family: 4,

      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },

      tls: {
        rejectUnauthorized: false,
      },
    });

    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(
          '❌ Mail server connection failed',
          error,
        );
      } else {
        this.logger.log(
          '✅ Mail server connected successfully',
        );
      }
    });
  }

  async sendMail(options: {
    email: string;
    subject: string;
    html: string;
  }) {

    try {
      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: options.email,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(
        `📨 Email sent to ${options.email}`,
      );

      return result;

    } catch (error) {
      console.error('❌ SMTP SEND ERROR:', error);
      throw error;
    }
  }
}