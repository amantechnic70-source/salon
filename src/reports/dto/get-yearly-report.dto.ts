import { IsOptional } from 'class-validator';

export class GetYearlyReportDto {

    @IsOptional()
    year?: string;

}