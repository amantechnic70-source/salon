import {
    IsNumber,
    IsString,
} from 'class-validator';

export class CreatePlanDto {

    @IsString()
    name: string;

    @IsNumber()
    amount: number;

    @IsNumber()
    durationInDays: number;

    @IsNumber()
    maxStaff: number;

    @IsNumber()
    maxBranches: number;

    @IsNumber()
    maxBookings: number;

    @IsString()
    description: string;

}