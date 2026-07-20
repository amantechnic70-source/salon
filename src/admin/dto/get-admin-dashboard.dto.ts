import {
    IsOptional,
} from 'class-validator';

export class GetAdminDashboardDto {

    @IsOptional()
    month?: string;

    @IsOptional()
    year?: string;

}