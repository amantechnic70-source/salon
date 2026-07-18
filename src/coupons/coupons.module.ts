import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    Coupon,
    CouponSchema,
} from '../schemas/coupon.schema';

import {
    Salon,
    SalonSchema,
} from '../schemas/salon.schema';

import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

@Module({

    imports: [

        MongooseModule.forFeature([

            {
                name: Coupon.name,
                schema: CouponSchema,
            },

            {
                name: Salon.name,
                schema: SalonSchema,
            },

        ]),

    ],

    controllers: [
        CouponsController,
    ],

    providers: [
        CouponsService,
    ],

    exports: [
        CouponsService,
    ],

})
export class CouponsModule { }