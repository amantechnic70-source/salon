import { IsOptional } from 'class-validator';

export class GetCustomerReportDto {

    @IsOptional()
    startDate?: string;

    @IsOptional()
    endDate?: string;

}