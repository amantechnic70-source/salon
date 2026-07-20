import { IsOptional } from 'class-validator';

export class GetDashboardDto {

    @IsOptional()
    page?: string = '1';

    @IsOptional()
    limit?: string = '10';

    @IsOptional()
    branchId?: string;

    @IsOptional()
    startDate?: string;

    @IsOptional()
    endDate?: string;

}