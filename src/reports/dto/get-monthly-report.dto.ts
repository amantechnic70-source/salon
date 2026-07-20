import { IsOptional } from 'class-validator';

export class GetMonthlyReportDto {

    @IsOptional()
    month?: string;

    @IsOptional()
    year?: string;

}