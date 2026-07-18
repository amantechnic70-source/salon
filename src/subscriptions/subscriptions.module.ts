import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';


import {
    Subscription,
    SubscriptionSchema,
} from '../schemas/subscription.schema';

import {
    SubscriptionPlan,
    SubscriptionPlanSchema,
} from '../schemas/subscription-plan.schema';

import {
    Salon,
    SalonSchema,
} from '../schemas/salon.schema';
import { SubscriptionController } from './subscriptions.controller';
import { SubscriptionService } from './subscriptions.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Subscription.name,
                schema: SubscriptionSchema,
            },
            {
                name: SubscriptionPlan.name,
                schema: SubscriptionPlanSchema,
            },
            {
                name: Salon.name,
                schema: SalonSchema,
            },
        ]),
    ],
    controllers: [
        SubscriptionController,
    ],
    providers: [
        SubscriptionService,
    ],
    exports: [
        SubscriptionService,
    ],
})
export class SubscriptionModule {}