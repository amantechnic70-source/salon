import {
    IsMongoId,
    IsOptional,
    IsString,
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
    price?: number;

    @IsOptional()
    discount?: number;

    @IsOptional()
    duration?: number;

}