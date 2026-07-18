import {
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdatePlanDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsNumber()
    durationInDays?: number;

    @IsOptional()
    @IsNumber()
    maxStaff?: number;

    @IsOptional()
    @IsNumber()
    maxBranches?: number;

    @IsOptional()
    @IsNumber()
    maxBookings?: number;

    @IsOptional()
    @IsString()
    description?: string;

}