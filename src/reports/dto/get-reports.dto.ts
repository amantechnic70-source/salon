import { IsOptional } from 'class-validator';

export class GetReportDto {

    @IsOptional()
    startDate?: string;

    @IsOptional()
    endDate?: string;

    @IsOptional()
    branchId?: string;

}