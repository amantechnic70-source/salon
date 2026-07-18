

import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: Number(this.configService.get<number>('MAIL_PORT')),
            secure: this.configService.get<boolean>('MAIL_SECURE'), // true for 465
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASSWORD'),
            },
            tls: {
                rejectUnauthorized: false, // 🔥 THIS FIXES THE ERROR
            },
        });


        // ✅ Verify connection at startup
        this.transporter.verify((error) => {
            if (error) {
                this.logger.error('❌ Mail server connection failed', error);
            } else {
                this.logger.log('✅ Mail server connected successfully');
            }
        });
    }

    /**
     * 📧 Generic Send Mail
     */
    async sendMail(options: {
        email: string;
        subject: string;
        html: string;
    }) {
        console.log('📨 SENDING MAIL TO', options.email);
        await this.transporter.sendMail({
            from: this.configService.get<string>('MAIL_FROM'),
            to: options.email,
            subject: options.subject,
            html: options.html,
        });

        this.logger.log(`📨 Email sent to ${options.email}`);
    }
}

