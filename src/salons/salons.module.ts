import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SalonsController } from './salons.controller';
import { SalonsService } from './salons.service';

import { Salon, SalonSchema } from 'src/schemas/salon.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Salon.name,
                schema: SalonSchema,
            },
            {
                name: User.name,
                schema: UserSchema,
            },
        ]),
    ],
    controllers: [
        SalonsController,
    ],
    providers: [
        SalonsService,
    ],
    exports: [
        SalonsService,
    ],
})
export class SalonsModule {}