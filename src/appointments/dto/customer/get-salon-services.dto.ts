import {
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';

export class GetSalonServicesDto {

    @IsMongoId()
    salonId: string;

    @IsOptional()
    @IsMongoId()
    branchId?: string;

    @IsOptional()
    @IsString()
    category?: string;

}