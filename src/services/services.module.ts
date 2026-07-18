import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    Service,
    ServiceSchema,
} from '../schemas/service.schema';

import {
    Salon,
    SalonSchema,
} from '../schemas/salon.schema';

import {
    Branch,
    BranchSchema,
} from '../schemas/branch.schema';

import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Service.name,
                schema: ServiceSchema,
            },
            {
                name: Salon.name,
                schema: SalonSchema,
            },
            {
                name: Branch.name,
                schema: BranchSchema,
            },
        ]),
    ],
    controllers: [
        ServicesController,
    ],
    providers: [
        ServicesService,
    ],
    exports: [
        ServicesService,
    ],
})
export class ServicesModule {}