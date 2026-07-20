import { IsOptional } from 'class-validator';

export class GetStaffReportDto {

    @IsOptional()
    branchId?: string;

}