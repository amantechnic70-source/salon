import { IsOptional } from 'class-validator';

export class GetAttendanceReportDto {

    @IsOptional()
    month?: string;

    @IsOptional()
    year?: string;

}