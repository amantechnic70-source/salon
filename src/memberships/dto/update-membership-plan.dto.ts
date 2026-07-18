import {
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class UpdateMembershipPlanDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    amount?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    durationInDays?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discountPercentage?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    loyaltyPoints?: number;

    @IsOptional()
    @IsString()
    description?: string;

}