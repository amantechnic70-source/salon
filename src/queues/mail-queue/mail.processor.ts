import { Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';

import { MailService } from '../../mail/mail.service';

@Processor("mail-queue")
export class MailProcessor extends WorkerHost {

    constructor(

        private readonly mailService: MailService,

    ) {

        super();

    }


    async process(job: Job<any>) {

        switch (job.name) {

            case "forgot-password":

                await this.mailService.sendMail({
                    email: job.data.email,
                    subject: job.data.subject,
                    html: job.data.html,

                });

                break;



            case "welcome-email":

                await this.mailService.sendMail({

                    email: job.data.email,
                    subject: job.data.subject,
                    html: job.data.html,

                });

                break;



            case "password-changed":

                await this.mailService.sendMail({

                    email: job.data.email,
                    subject: job.data.subject,
                    html: job.data.html,

                });

                break;

            case 'send-otp':

                await this.mailService.sendMail({

                    email: job.data.email,
                    subject: job.data.subject,
                    html: job.data.html,

                });

                break;


        }

    }

}