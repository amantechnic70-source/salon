import { IsOptional } from 'class-validator';

export class GetAppointmentReportDto {

    @IsOptional()
    startDate?: string;

    @IsOptional()
    endDate?: string;

}