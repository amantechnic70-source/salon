import {
    IsEnum,
    IsInt,
    IsOptional,
    Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class GetAppointmentPaymentsDto {

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit = 10;

    @IsOptional()
    @IsEnum([
        'PENDING',
        'SUCCESS',
        'FAILED',
        'REFUNDED',
    ])
    paymentStatus?: string;

    @IsOptional()
    @IsEnum([
        'ONLINE',
        'OFFLINE',
    ])
    paymentMethod?: string;

}