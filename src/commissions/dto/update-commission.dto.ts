import {
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateCommissionDto {

    @IsOptional()
    @IsNumber()
    commissionPercentage?: number;

    @IsOptional()
    @IsString()
    remarks?: string;

}