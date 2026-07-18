import {
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateMembershipPlanDto {

    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsNumber()
    @Min(1)
    durationInDays: number;

    @IsNumber()
    @Min(0)
    discountPercentage: number;

    @IsNumber()
    @Min(0)
    loyaltyPoints: number;

    @IsOptional()
    @IsString()
    description?: string;

}