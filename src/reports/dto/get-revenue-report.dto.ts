import { IsOptional } from 'class-validator';

export class GetRevenueReportDto {

    @IsOptional()
    month?: string;

    @IsOptional()
    year?: string;

}