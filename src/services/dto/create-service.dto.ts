import {
    IsMongoId,
    IsOptional,
    IsString,
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

    price: number;

    discount?: number;

    duration: number;

}