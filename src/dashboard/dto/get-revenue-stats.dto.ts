import { IsOptional } from 'class-validator';

export class GetRevenueStatsDto {

    @IsOptional()
    month?: string;

    @IsOptional()
    year?: string;

}