import {
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    Max,
} from 'class-validator';

export class CreateServiceDto {

    @IsMongoId()
    branchId: string;

    @IsString()
    name: string;

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

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discount?: number;

    @IsNumber()
    @Min(1)
    duration: number;

}