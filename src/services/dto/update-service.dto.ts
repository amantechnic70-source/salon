import {
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    Max,
} from 'class-validator';

export class UpdateServiceDto {

    @IsOptional()
    @IsMongoId()
    branchId?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    serviceImage?: string;

    @IsOptional()
    @IsString()
    genderType?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discount?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    duration?: number;

}