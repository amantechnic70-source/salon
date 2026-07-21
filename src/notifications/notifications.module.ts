import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationSchema, Notifications } from 'src/schemas/notification.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({

    imports: [

        MongooseModule.forFeature([

            {
                name: Notifications.name,
                schema: NotificationSchema,
            },

            {
                name: User.name,
                schema: UserSchema,
            },

        ]),

    ],

    controllers: [
        NotificationsController,
    ],

    providers: [
        NotificationsService,
    ],

    exports: [
        NotificationsService,
    ],

})
export class NotificationsModule { }