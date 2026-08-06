import {
    IsInt,
    IsOptional,
    Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class GetMyBookingsDto {

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

}